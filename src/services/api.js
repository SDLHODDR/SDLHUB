import axios from "axios";
import { createController, removeController } from "./requestManager";

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
    url.includes("login") ||
    url.includes("logout")
  );
};

const isGetRequest = (method = "") => {
  return method.toLowerCase() === "get";
};

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

    (response) => {

      // Cleanup controller
      if (response?.config?._controller) {
        removeController(
          response.config._controller
        );
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
        return Promise.reject(error);
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
