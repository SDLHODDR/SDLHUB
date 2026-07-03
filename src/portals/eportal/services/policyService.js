import { request } from "../../../services/request"; // central handler
import { EPORTAL_API } from "../config/eportalApiConfig";

/* ---------------------------
   POLICIES API
---------------------------- */
export const getPolicies = () =>
  request({
    url: EPORTAL_API.POLICIES.GET_POLICIES,
    method: "GET",

    // IMPORTANT FIX
    isEportal: true,
    
    // prevents duplicate API calls (React StrictMode, re-renders, etc.)
    dedupe: true,

    // optional: cache result for some time (fast navigation)
    cache: true,
    cacheTime: 5 * 60 * 1000, // 5 minutes

    // fallback if API fails or canceled
    fallback: {
      status: false,
      data: []
    }
  });


export const getActivePolicies = () =>
  request({
    url: EPORTAL_API.POLICIES.GET_ACTIVE_POLICIES,
    method: "GET",

    // IMPORTANT FIX
    isEportal: true,
    
    // prevents duplicate API calls (React StrictMode, re-renders, etc.)
    dedupe: true,

    // optional: cache result for some time (fast navigation)
    cache: true,
    cacheTime: 5 * 60 * 1000, // 5 minutes

    // fallback if API fails or canceled
    fallback: {
      status: false,
      data: []
    }
  });