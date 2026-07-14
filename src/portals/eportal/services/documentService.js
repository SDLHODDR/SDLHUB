import { eportalRequest } from "../../../services/request";
import { EPORTAL_API } from "../config/eportalApiConfig";

/* ---------------------------
   DOCUMENTS API
---------------------------- */
export const getDocuments = () =>
  eportalRequest ({
    url: EPORTAL_API.DOCUMENTS.GET_DOCUMENTS,
    method: "GET",

    // prevent duplicate calls
    dedupe: true,

    // cache for faster revisit
    cache: true,
    cacheTime: 5 * 60 * 1000,

    // safe fallback
    fallback: {
      status: false,
      data: [],
    },
  });