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

    (error) => {

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
attachInterceptor(eppAPI);