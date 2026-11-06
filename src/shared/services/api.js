import axios from "axios";
import {
  cancelAllRequests,
  createController,
  hasCancelledAllRequests,
  removeController,
} from "./requestManager";

/* ============================
   BASE CONFIG
============================ */

const BASE_URL = import.meta.env.VITE_API_URL;

/* ============================
   AUTH / CORE APIs
============================ */

export const coreAPI = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const secureAPI = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ============================
   EPORTAL APIs
============================ */

export const eportalAPI = axios.create({
  baseURL: `${BASE_URL}/eportal`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ============================
   HRMS APIs
============================ */

export const hrmsAPI = axios.create({
  baseURL: `${BASE_URL}/hrms`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ============================
   EPP APIs
============================ */

export const eppAPI = axios.create({
  baseURL: `${BASE_URL}/epp`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const telegramPSRAPI = axios.create({
  baseURL:
    import.meta.env.VITE_TELEGRAM_API_URL || `${BASE_URL}/psr_telegram/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ============================
   HELPER: IDENTIFY SAFE CALLS
============================ */

const isAuthCall = (url = "") => {
  return (
    url.includes("session_check") ||
    url.includes("session_keepalive") ||
    url.includes("login") ||
    url.includes("logout")
  );
};

const isGetRequest = (method = "") => {
  return method.toLowerCase() === "get";
};

/* ============================
   SESSION EXPIRY
============================ */

const PUBLIC_PATHS = ["/login", "/forgot-password"];

// A wrong password also returns 401, and logout redirects by itself.
const isLoginOrLogoutCall = (url = "") =>
  url.includes("auth.php") || url.includes("logout.php");

let redirectingToLogin = false;

// Returns false on a public page, where there is no session to lose.
export const redirectToLogin = () => {
  if (PUBLIC_PATHS.includes(window.location.pathname)) {
    return false;
  }

  if (!redirectingToLogin) {
    redirectingToLogin = true;
    cancelAllRequests();
    localStorage.clear();
    window.location.replace("/login?session=expired");
  }

  return true;
};

// The page is being replaced: never settle, so the caller shows no error
// message or alert in the moment before the login screen loads.
const pendingUntilRedirect = () => new Promise(() => {});

const isSessionExpiredError = (error) =>
  error?.response?.status === 401 &&
  !isLoginOrLogoutCall(error?.config?.url) &&
  redirectToLogin();

let sessionCheckInFlight = null;

// Not every endpoint answers 401 without a session: some return 200 with
// "Not logged in", others fail with a different error. So when any request
// fails, ask the backend before showing that failure to the user. If the backend
// can't be reached, the session is unknown and the original error stands.
const redirectIfSessionEnded = async (url = "") => {
  if (isAuthCall(url) || isLoginOrLogoutCall(url)) {
    return false;
  }

  if (!sessionCheckInFlight) {
    sessionCheckInFlight = coreAPI
      .get("/session_check.php")
      .then((response) => response?.data?.logged_in === false)
      .catch(() => false)
      .finally(() => {
        sessionCheckInFlight = null;
      });
  }

  return (await sessionCheckInFlight) && redirectToLogin();
};

const isFailedResponse = (data) =>
  data?.status === false || data?.success === false;

/* ============================
   INTERCEPTOR
============================ */

const attachInterceptor = (instance) => {

  /* ---------- REQUEST ---------- */

  instance.interceptors.request.use(
    (config) => {

      const url = config.url || "";
      const method = config.method || "get";

      const authCall = isAuthCall(url);
      const isGet = isGetRequest(method);

      /*
      |--------------------------------------------------------------------------
      | CSRF TOKEN
      |--------------------------------------------------------------------------
      | Token is shared between browser tabs using localStorage.
      |--------------------------------------------------------------------------
      */

      const csrfToken = localStorage.getItem("csrf_token");

      if (csrfToken) {
        config.headers = config.headers || {};

        config.headers["X-CSRF-Token"] = csrfToken;
      }

      /*
      |--------------------------------------------------------------------------
      | ABORT CONTROLLER
      |--------------------------------------------------------------------------
      | Only attach to GET requests.
      | Don't attach to authentication/session APIs.
      |--------------------------------------------------------------------------
      */

      if (!config.signal && isGet && !authCall) {

        const controller = createController();

        config.signal = controller.signal;
        config._controller = controller;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  /* ---------- RESPONSE ---------- */

  instance.interceptors.response.use(

    async (response) => {

      // Cleanup controller
      if (response?.config?._controller) {
        removeController(
          response.config._controller
        );
      }

      if (
        isFailedResponse(response?.data) &&
        (await redirectIfSessionEnded(response?.config?.url))
      ) {
        return pendingUntilRedirect();
      }

      return response;
    },

    async (error) => {

      // Cleanup controller
      if (error?.config?._controller) {
        removeController(
          error.config._controller
        );
      }

      /*
      |--------------------------------------------------------------------------
      | REQUEST CANCELLED
      |--------------------------------------------------------------------------
      */

      if (
        error?.name === "CanceledError" ||
        error?.code === "ERR_CANCELED"
      ) {
        // Logout or session expiry: the page is going away, so don't let the
        // caller show a "Request was cancelled" message first.
        if (hasCancelledAllRequests()) {
          return pendingUntilRedirect();
        }

        return Promise.reject(error);
      }

      if (isSessionExpiredError(error)) {
        return pendingUntilRedirect();
      }

      const requestConfig = error?.config;
      const isCsrfRejection =
        error?.response?.status === 403 &&
        String(error?.response?.data?.message || "")
          .toLowerCase()
          .includes("invalid csrf token");

      // A session change in another tab can leave localStorage with an old
      // token. Refresh from this session and retry once; CSRF validation runs
      // before the protected handler, so the rejected request has not run.
      if (isCsrfRejection && requestConfig && !requestConfig._csrfRetry) {
        requestConfig._csrfRetry = true;

        try {
          const sessionResponse = await coreAPI.get("/session_check.php");
          const currentToken = sessionResponse?.data?.csrf_token;

          // CSRF validation runs first on a POST, so an expired session reaches
          // here as "Invalid CSRF token" rather than as a 401.
          if (sessionResponse?.data?.logged_in === false && redirectToLogin()) {
            return pendingUntilRedirect();
          }

          if (currentToken) {
            localStorage.setItem("csrf_token", currentToken);
            requestConfig.headers = requestConfig.headers || {};
            requestConfig.headers["X-CSRF-Token"] = currentToken;
            return instance.request(requestConfig);
          }
        } catch {
          // Keep the original CSRF error if the session cannot be refreshed.
        }
      }

      if (await redirectIfSessionEnded(requestConfig?.url)) {
        return pendingUntilRedirect();
      }

      return Promise.reject(error);
    }
  );
};

/* ============================
   APPLY INTERCEPTORS
============================ */

attachInterceptor(coreAPI);
attachInterceptor(secureAPI);
attachInterceptor(eportalAPI);
attachInterceptor(hrmsAPI);
attachInterceptor(eppAPI);
attachInterceptor(telegramPSRAPI);

// The letter previews call plain axios, not one of the instances above.
axios.interceptors.response.use(undefined, async (error) => {
  if (
    isSessionExpiredError(error) ||
    (await redirectIfSessionEnded(error?.config?.url))
  ) {
    return pendingUntilRedirect();
  }

  return Promise.reject(error);
});
