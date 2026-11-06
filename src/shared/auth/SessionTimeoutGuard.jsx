import { useEffect, useRef, useState } from "react";
import { keepSessionAlive, logoutAPI } from "../services/authService";
import { redirectToLogin } from "../services/api";

// The backend's limit (SESSION_IDLE_TIMEOUT in config/session.php) replaces this
// on the first keepalive response.
const DEFAULT_IDLE_LIMIT_MS = 15 * 60 * 1000;
const WARNING_MS = 60 * 1000;
const KEEPALIVE_INTERVAL_MS = 60 * 1000;
const LOGOUT_WAIT_MS = 5000;

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "wheel", "scroll", "touchstart"];

// Shared through localStorage so that working in one tab keeps the others open.
const LAST_ACTIVITY_KEY = "session_last_activity";
const LAST_KEEPALIVE_KEY = "session_last_keepalive";

const memory = {};

const readTime = (key) => {
  try {
    const value = Number(localStorage.getItem(key));
    if (value) return value;
  } catch {
    // Storage unavailable: this tab tracks its own time.
  }
  return memory[key] || 0;
};

const writeTime = (key, value) => {
  memory[key] = value;
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Storage unavailable: the in-memory value is used.
  }
};

/*
 * Logs the user out after a period of inactivity, warning them first.
 * Only real input counts as activity, which is reported to the backend at most
 * once a minute. Time is measured from timestamps, not by counting timer ticks,
 * so background tabs and a sleeping computer are handled correctly.
 */
const SessionTimeoutGuard = () => {
  const [secondsLeft, setSecondsLeft] = useState(null);
  const stayLoggedIn = useRef(null);

  useEffect(() => {
    let idleLimitMs = DEFAULT_IDLE_LIMIT_MS;
    let ending = false;

    const sendKeepalive = async () => {
      writeTime(LAST_KEEPALIVE_KEY, Date.now());
      try {
        const res = await keepSessionAlive();
        if (res?.idle_timeout) idleLimitMs = res.idle_timeout * 1000;
      } catch (err) {
        // A 401 redirects in the API layer. Anything else is retried on the
        // next activity, and the backend still enforces the limit.
        console.error("Session keepalive failed:", err);
      }
    };

    const endSession = async () => {
      ending = true;
      await Promise.race([
        logoutAPI().catch(() => {}),
        new Promise((resolve) => setTimeout(resolve, LOGOUT_WAIT_MS)),
      ]);
      redirectToLogin();
    };

    const tick = () => {
      if (ending) return;

      const now = Date.now();
      const lastActivity = readTime(LAST_ACTIVITY_KEY);
      const idleMs = now - lastActivity;

      if (idleMs >= idleLimitMs) {
        endSession();
        return;
      }

      setSecondsLeft(
        idleMs >= idleLimitMs - WARNING_MS
          ? Math.ceil((idleLimitMs - idleMs) / 1000)
          : null
      );

      const lastKeepalive = readTime(LAST_KEEPALIVE_KEY);
      if (lastActivity > lastKeepalive && now - lastKeepalive >= KEEPALIVE_INTERVAL_MS) {
        sendKeepalive();
      }
    };

    const onActivity = () => {
      const now = Date.now();
      const idleMs = now - readTime(LAST_ACTIVITY_KEY);
      // Once the warning shows, only its button extends the session, so a
      // nudged mouse does not dismiss it unread.
      if (ending || idleMs < 1000 || idleMs >= idleLimitMs - WARNING_MS) return;
      writeTime(LAST_ACTIVITY_KEY, now);
    };

    stayLoggedIn.current = () => {
      writeTime(LAST_ACTIVITY_KEY, Date.now());
      setSecondsLeft(null);
      sendKeepalive();
    };

    writeTime(LAST_ACTIVITY_KEY, Date.now());
    sendKeepalive();

    const timer = setInterval(tick, 1000);
    ACTIVITY_EVENTS.forEach((name) =>
      window.addEventListener(name, onActivity, { passive: true, capture: true })
    );
    document.addEventListener("visibilitychange", tick);

    return () => {
      clearInterval(timer);
      ACTIVITY_EVENTS.forEach((name) =>
        window.removeEventListener(name, onActivity, { capture: true })
      );
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  if (secondsLeft === null) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
      aria-describedby="session-timeout-message"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 20000 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0">
          <div className="modal-header">
            <h5 className="modal-title" id="session-timeout-title">
              Are you still there?
            </h5>
          </div>
          <div className="modal-body" id="session-timeout-message">
            You will be logged out in <strong>{secondsLeft}</strong>{" "}
            {secondsLeft === 1 ? "second" : "seconds"} because of inactivity.
            Anything you haven't saved will be lost.
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              autoFocus
              onClick={() => stayLoggedIn.current()}
            >
              Stay logged in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutGuard;
