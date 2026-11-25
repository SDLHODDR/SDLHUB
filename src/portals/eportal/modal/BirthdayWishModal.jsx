import { useState } from "react";
import { sendBirthdayWish } from "../services/dashboardService";
import { notifyError, notifySuccess } from "../../../shared/services/alertService";

const MAX_CHARS = 500; // EPT_USER_MESSAGES.MESSAGE holds 500 characters

/**
 * "Let's wish <name> a Happy Birthday" popup (old ePortal: myspace/dashboard_util.php?getWishmodal).
 * Works on the birthday or in advance (employee.birthdayLabel, e.g. "27th Nov", for an upcoming one).
 * If a wish was already sent for this birthday it is shown read-only, as in the old ePortal.
 */
const BirthdayWishModal = ({ employee, onClose, onSent }) => {
  const alreadySent = !!employee?.message;
  const [message, setMessage] = useState(employee?.message || "");
  const [sending, setSending] = useState(false);

  if (!employee) return null;

  const handleSend = async () => {
    const text = message.trim();
    if (!text) {
      notifyError("Please write your wish.");
      return;
    }

    setSending(true);
    try {
      const res = await sendBirthdayWish(employee.emp_code, text);
      if (!res?.status) {
        notifyError(res?.message || "Unable to send your wish.");
        return;
      }
      notifySuccess(res.message || "Your wish has been sent!");
      onSent?.(employee.emp_code, text);
      onClose?.();
    } catch (err) {
      notifyError(err?.message || "Unable to send your wish.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="modal fade show d-block" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">
                🎉 Let&apos;s wish <span className="text-primary">{employee.name}</span> a Happy Birthday 🎂
                {employee.birthdayLabel && (
                  <small className="d-block text-muted fw-normal mt-1" style={{ fontSize: 13 }}>
                    Birthday on {employee.birthdayLabel}. {employee.name} will see your wish on the day.
                  </small>
                )}
              </h5>
              <button
                type="button"
                className="btn-close custom-btn-close p-0"
                onClick={onClose}
                disabled={sending}
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>

            <div className="modal-body">
              <label htmlFor="birthday-wish" className="form-label">
                {alreadySent ? "Your wish" : "Your message"}
              </label>
              <textarea
                id="birthday-wish"
                className="form-control"
                rows={4}
                style={{ minHeight: 110, resize: "vertical" }}
                maxLength={MAX_CHARS}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                readOnly={alreadySent}
                disabled={sending}
                placeholder="Write your birthday wish…"
                autoFocus={!alreadySent}
              />
              {alreadySent ? (
                <small className="text-muted d-block mt-2">
                  You have already sent your wish for this birthday.
                </small>
              ) : (
                <small className="char-counter text-muted d-block mt-1">
                  {message.length} / {MAX_CHARS}
                </small>
              )}
            </div>

            <div className="modal-footer gap-2">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={sending}>
                Close
              </button>
              {!alreadySent && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSend}
                  disabled={sending || !message.trim()}
                >
                  {sending ? "Sending…" : "Send a Wish!"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
};

export default BirthdayWishModal;
