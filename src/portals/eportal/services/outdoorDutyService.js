import { eportalRequest, request } from "../../../services/request"; // central handler
import { EPORTAL_API } from "../config/eportalApiConfig";
import { eportalAPI } from "../../../services/api";
import { PORTALAPI } from "../../../services/apiConfig";

/* ---------------------------
   OUTDOOR DUTIES API
---------------------------- */
export const getOutDuties = () =>
  request({
    url: EPORTAL_API.GATEPASS.GET_GP_LIST,
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

export const getGPDataDetails = (payload = {}) => 
  eportalRequest({
    url: PORTALAPI.GATEPASS.GPData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const getGpAttdData = (payload = {}) => 
  eportalRequest({
    url: PORTALAPI.GATEPASS.GPData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const outDoorDutyFetchData = () => 
  eportalRequest({
    url: EPORTAL_API.GATEPASS.GET_GP_LIST,
    method: "GET",
    dedupe: true,
    fallback: {
      status: false,
      data: [],
    },
  });

export const getGPSVDataDetails = (payload = {}) =>
  eportalRequest({
    url: PORTALAPI.GATEPASS.GPSVData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const saveGPData = (payload = {}) => 
  eportalRequest({
    url: PORTALAPI.GATEPASS.SAVEGPData,
    method: "POST",
    dedupe: true,
    data: payload,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const saveGPDataAUTH = (payload = {}) => 
  eportalRequest({
    url: PORTALAPI.GATEPASS.SAVEGPDataAuth,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const authGPData = async (payload = {}) =>
  eportalRequest({
    url: PORTALAPI.GATEPASS.AUTHGPData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const rejectGPData = (payload = {}) =>
  eportalRequest({
    url: PORTALAPI.GATEPASS.REJECTGPData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const getGatePassList = (payload = {}) =>
  eportalRequest({
    url: PORTALAPI.GATEPASS.GP_LIST,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const authGPDataDetails = (payload = {}) =>
  eportalRequest({
    url: PORTALAPI.GATEPASS.AUTHGPData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const sendauthGPDataDetails = (payload = {}) =>
  eportalRequest({
    url: PORTALAPI.GATEPASS.SENDAUTHGPData,
    method: "POST",
    dedupe: true,
    data: payload,
  });
  
export const closeGPTicket = (payload = {}) => 
  eportalRequest({
    url: PORTALAPI.GATEPASS.CLOSEGPData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const resendauthGPDataDetails = (payload = {}) =>
  eportalRequest({
    url: PORTALAPI.GATEPASS.RESENDAUTHGPData,
    method: "POST",
    dedupe: true,
    data: payload,
  });
