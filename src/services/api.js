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

eportalAPI.interceptors.request.use((config) => {
  const csrfToken = sessionStorage.getItem("csrf_token");
  if (csrfToken) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }
  return config;
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

eppAPI.interceptors.request.use((config) => {
  const csrfToken = sessionStorage.getItem("csrf_token");
  if (csrfToken) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }
  return config;
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

const isGetRequest = (method = "") => method.toLowerCase() === "get";

/* ============================
   INTERCEPTOR
============================ */

const attachInterceptor = (instance) => {

  /* ---------- REQUEST ---------- */
  instance.interceptors.request.use((config) => {
    const url = config.url || "";
    const method = config.method || "get";

    const authCall = isAuthCall(url);
    const isGet = isGetRequest(method);

    /**
     * Attach AbortController ONLY for:
     * GET requests
     * NOT auth/session APIs
     */
    if (!config.signal && isGet && !authCall) {
      const controller = createController();
      config.signal = controller.signal;
      config._controller = controller;
    }

    return config;
  });

  /* ---------- RESPONSE ---------- */
  instance.interceptors.response.use(
    (response) => {
      // cleanup controller
      if (response?.config?._controller) {
        removeController(response.config._controller);
      }
      return response;
    },
    (error) => {
      // cleanup controller
      if (error?.config?._controller) {
        removeController(error.config._controller);
      }

      /**
       * IMPORTANT:
       * Do NOT convert cancel into success
       * Let it be handled in service layer
       */
      if (
        error?.name === "CanceledError" ||
        error?.code === "ERR_CANCELED"
      ) {
        return Promise.reject(error);
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
