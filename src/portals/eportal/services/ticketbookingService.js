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

export const getTBRDataDetails = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.TICKETBOOKING.TBData,
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

export const saveTBRData = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.TICKETBOOKING.SAVETBData,
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

export const saveTBRDataAUTH = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.TICKETBOOKING.SAVETBDataAuth,
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

export const editTBRData = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.TICKETBOOKING.EDITTBData,
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

export const editTBRDataAUTH = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.TICKETBOOKING.EDITTBDataAuth,
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

export const authTBRData = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.TICKETBOOKING.AUTHTBData,
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

export const rejectTBRData = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.TICKETBOOKING.REJECTTBData,
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

export const deleteTBRData = async (payload = {}) => {
  console.log("---------------deleteTBRData---------------", payload);
  const res = await eportalAPI.post(
    PORTALAPI.TICKETBOOKING.DELETETBData,
    payload,
    {
      // headers: {
      //   "X-CSRF-Token": csrfToken
      // },
      withCredentials: true
    }
  );
  console.log("---------------deresponse leteTBRData---------------", res);
  return res.data || [];
};

export const getTBRList = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.TICKETBOOKING.TB_LIST,
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

export const sendauthTBDataDetails = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.TICKETBOOKING.SENDAUTHTBData,
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

export const closeTBTicket = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.TICKETBOOKING.CLOSETBData,
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

export const resendauthTBDataDetails = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.TICKETBOOKING.RESENDAUTHTBData,
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