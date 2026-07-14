import { eportalRequest } from "../../../services/request";
import { EPORTAL_API } from "../config/eportalApiConfig";

/* ---------------------------
   PAYSLIPS API
---------------------------- */
export const getPayslips = () =>
  eportalRequest({
    url: EPORTAL_API.PAYSLIPS.GET_PAYSLIPS,
    method: "GET",

    // IMPORTANT FIX
    isEportal: true,

    // prevent duplicate calls (React StrictMode safe)
    dedupe: true,

    // cache for faster revisit
    cache: true,
    cacheTime: 5 * 60 * 1000, // 5 minutes

    // safe fallback
    fallback: {
      status: false,
      data: []
    }
  });
