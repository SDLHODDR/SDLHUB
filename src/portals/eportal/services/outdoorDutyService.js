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

export const getGPSVDataDetails = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.GATEPASS.GPSVData,
    payload,
    {
      // headers: {
      //   "X-CSRF-Token": csrfToken
      // },
      withCredentials: true
    }
  );
  return res.data.pass || [];
};

export const saveGPData = (payload = {}) => 
  eportalRequest({
    url: PORTALAPI.GATEPASS.SAVEGPData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const saveGPDataAUTH = (payload = {}) => 
  eportalRequest({
    url: PORTALAPI.GATEPASS.SAVEGPDataAuth,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const authGPData = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.GATEPASS.AUTHGPData,
    payload,
    {
      // headers: {
      //   "X-CSRF-Token": csrfToken
      // },
      withCredentials: true
    }
  );
  
  return res.data || [];
};

export const rejectGPData = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.GATEPASS.REJECTGPData,
    payload,
    {
      // headers: {
      //   "X-CSRF-Token": csrfToken
      // },
      withCredentials: true
    }
  );
  
  return res.data || [];
};

export const getGatePassList = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.GATEPASS.GP_LIST,
    payload,
    {
      // headers: {
      //   "X-CSRF-Token": csrfToken
      // },
      withCredentials: true
    }
  );

  return res.data || { data: [], total: 0 };
};

export const authGPDataDetails = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.GATEPASS.AUTHGPData,
    payload,
    {
      // headers: {
      //   "X-CSRF-Token": csrfToken
      // },
      withCredentials: true
    }
  );
  
  return res || [];
};

export const sendauthGPDataDetails = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.GATEPASS.SENDAUTHGPData,
    payload,
    {
      // headers: {
      //   "X-CSRF-Token": csrfToken
      // },
      withCredentials: true
    }
  );
  
  return res.data || {};
};

export const closeGPTicket = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.GATEPASS.CLOSEGPData,
    payload,
    {
      // headers: {
      //   "X-CSRF-Token": csrfToken
      // },
      withCredentials: true
    }
  );
  
  return res || [];
};

export const resendauthGPDataDetails = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.GATEPASS.RESENDAUTHGPData,
    payload,
    {
      // headers: {
      //   "X-CSRF-Token": csrfToken
      // },
      withCredentials: true
    }
  );
  
  return res || [];
};