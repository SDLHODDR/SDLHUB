import { request } from "../../../services/request"; // central handler
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

export const getGPDataDetails = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.GATEPASS.GPData,
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

export const saveGPData = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.GATEPASS.SAVEGPData,
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

export const saveGPDataAUTH = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.GATEPASS.SAVEGPDataAuth,
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

export const editGPData = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.GATEPASS.EDITGPData,
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

export const editGPDataAUTH = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.GATEPASS.EDITGPDataAuth,
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

export const deleteGPData = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.GATEPASS.DELETEGPData,
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