import axios from "axios";
import { coreAPI, secureAPI, eportalAPI, eppAPI } from "./api";
import { API_MESSAGES } from "./apiMessages";

/* ============================
   REQUEST WRAPPERS
============================ */

export const coreRequest = (config) =>
  request({ ...config, api: coreAPI });

export const secureRequest = (config) =>
  request({ ...config, api: secureAPI });

export const eportalRequest = (config) =>
  request({ ...config, api: eportalAPI });

export const eppRequest = (config) =>
  request({ ...config, api: eppAPI });

/* ============================
   PENDING REQUESTS
============================ */

const pendingRequests = new Map();

/* ============================
   COMMON REQUEST
============================ */

export const request = async (config) => {
  const {
    api,
    fallback,
    dedupe = false,

    // Reserved for future implementation
    // cache,
    // cacheTime,

    ...axiosConfig
  } = config;

  const instance = api || secureAPI;

  /* ============================
     REQUEST KEY
  ============================ */

  const requestKey = dedupe
    ? [
        (axiosConfig.method || "GET").toUpperCase(),
        axiosConfig.url,
        JSON.stringify(axiosConfig.params || {}),
        JSON.stringify(axiosConfig.data || {}),
      ].join("|")
    : null;

  /* ============================
     RETURN EXISTING REQUEST
  ============================ */

  if (dedupe && pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey);
  }

  const requestPromise = (async () => {
    try {
      const response = await instance.request(axiosConfig);

      if (axiosConfig.responseType === "blob") {
        return response;
      }

      return response.data;
    } catch (error) {
      /* ---------- Request Cancelled ---------- */

      if (
        axios.isCancel(error) ||
        error.code === "ERR_CANCELED" ||
        error.name === "CanceledError"
      ) {
        const cancelError = new Error(API_MESSAGES.REQUEST_CANCELLED);
        cancelError.cancelled = true;
        cancelError.status = 0;
        throw cancelError;
      }

      /* ---------- Network Error ---------- */

      if (!error.response) {
        if (fallback && axiosConfig.responseType !== "blob") {
          return fallback;
        }

        const networkError = new Error(API_MESSAGES.NETWORK);
        networkError.status = 0;
        networkError.originalError = error;
        throw networkError;
      }

      /* ---------- HTTP Error ---------- */

      const { status, data } = error.response;

      let message;

      switch (status) {
        case 400:
          message = data?.message || API_MESSAGES.BAD_REQUEST;
          break;

        case 401:
          message = data?.message || API_MESSAGES.UNAUTHORIZED;
          break;

        case 403:
          message = data?.message || API_MESSAGES.FORBIDDEN;
          break;

        case 404:
          message = data?.message || API_MESSAGES.NOT_FOUND;
          break;

        case 422:
          message = data?.message || API_MESSAGES.VALIDATION;
          break;

        case 500:
          message = data?.message || API_MESSAGES.SERVER_ERROR;
          break;

        default:
          message =
            data?.message ||
            data?.error ||
            API_MESSAGES.UNKNOWN;
      }

      if (fallback && axiosConfig.responseType !== "blob") {
        return fallback;
      }

      const requestError = new Error(message);
      requestError.status = status;
      requestError.data = data;
      requestError.originalError = error;

      throw requestError;
    } finally {
      if (dedupe) {
        pendingRequests.delete(requestKey);
      }
    }
  })();

  if (dedupe) {
    pendingRequests.set(requestKey, requestPromise);
  }

  return requestPromise;
};