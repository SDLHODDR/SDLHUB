import { request } from "../../../services/request"; // central handler
import { EPORTAL_API } from "../config/eportalApiConfig";
import { eportalAPI } from "../../../services/api";
import { PORTALAPI } from "../../../services/apiConfig";
import moment from "moment";

/* ---------------------------
   OUTDOOR DUTIES API
---------------------------- */
export const getLeaves = () =>
  request({
    url: EPORTAL_API.LEAVEREQUEST.GET_LR_LIST,
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

export const getLRDataDetails = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.LEAVEREQUEST.LRData,
    payload,
    {
      withCredentials: true
    }
  );
  
  return res.data.pass || [];
};

export const saveLRData = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.LEAVEREQUEST.SAVELRData,
    payload,
    {
      withCredentials: true
    }
  );
  
  return res.data || [];
};

export const saveLRDataAUTH = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.LEAVEREQUEST.SAVELRDataAuth,
    payload,
    {
      withCredentials: true
    }
  );
  
  return res.data || [];
};

export const editLRData = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.LEAVEREQUEST.SAVELRData,
    payload,
    {
      withCredentials: true
    }
  );
  
  return res.data || [];
};

export const editLRDataAUTH = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.LEAVEREQUEST.SAVELRDataAuth,
    payload,
    {
      withCredentials: true
    }
  );
  
  return res.data || [];
};

export const authLRData = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.LEAVEREQUEST.AUTHLRData,
    payload,
    {
      withCredentials: true
    }
  );
  
  return res.data || [];
};

export const rejectLRData = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.LEAVEREQUEST.REJECTLEAVEData,
    payload,
    {
      withCredentials: true
    }
  );
  
  return res.data || [];
};

export const deleteLRData = async (payload = {}) => {
  console.log("---------------deleteTBRData---------------", payload);
  const res = await eportalAPI.post(
    PORTALAPI.LEAVEREQUEST.SAVELRData,
    payload,
    {
      withCredentials: true
    }
  );
  console.log("---------------deresponse leteTBRData---------------", res);
  return res.data || [];
};

export const getTBRList = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.LEAVEREQUEST.LR_LIST,
    payload,
    {
      withCredentials: true
    }
  );

  return res.data || { data: [], total: 0 };
};

export const isDateAllowed = (date) => {
  const clickedDate = moment(date).startOf("day");
  const today = moment().startOf("day");

  const isDecember = today.month() === 11;

  const firstDayOfCurrentMonth = today.clone().startOf("month");

  const lastAllowedDay = isDecember
    ? today.clone().endOf("month")
    : today.clone().add(1, "month").endOf("month");

  if (
    clickedDate.isBefore(firstDayOfCurrentMonth) ||
    clickedDate.isAfter(lastAllowedDay)
  ) {
    Swal.fire({
      icon: "warning",
      title: "Selection not allowed",
      text: `You can only select dates from ${firstDayOfCurrentMonth.format("DD-MMM-YYYY")} to ${lastAllowedDay.format("DD-MMM-YYYY")}`,
    });

    return false;
  }

  return true;
};

export const checkCL = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.LEAVEREQUEST.CHECKCLDATA,
    payload,
    {
      withCredentials: true
    }
  );
  
  return res || [];
};

export const checkOL = async (payload = {}) => {
  const res = await eportalAPI.post(
    PORTALAPI.LEAVEREQUEST.CHECKOLDATA,
    payload,
    {
      withCredentials: true
    }
  );
  
  return res || [];
};