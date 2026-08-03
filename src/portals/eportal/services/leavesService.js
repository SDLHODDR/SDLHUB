import { eportalRequest, request } from "../../../services/request"; // central handler
import { EPORTAL_API } from "../config/eportalApiConfig";
//import { eportalAPI } from "../../../services/api";
import { PORTALAPI } from "../../../services/apiConfig";
import moment from "moment";
import { notifyWarning } from "../../../services/alertService";

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

export const leaveRequestFetchData = () => 
  eportalRequest({
    url: EPORTAL_API.LEAVEREQUEST.GET_LR_LIST,
    method: "GET",
    dedupe: true,
    fallback: {
      status: false,
      data: [],
    },
  });

export const getLRDataDetails = (payload = {}) =>
  eportalRequest({
    url: PORTALAPI.LEAVEREQUEST.LRData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const saveLRData = (payload = {}) =>
  eportalRequest({
    url: PORTALAPI.LEAVEREQUEST.SAVELRData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const saveLRDataAUTH = (payload = {}) => 
  eportalRequest({
    url: PORTALAPI.LEAVEREQUEST.SAVELRDataAuth,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const editLRData = () => {};
export const editLRDataAUTH = () => {};

export const authLRData = async (payload = {}) =>
  eportalRequest({
    url:  PORTALAPI.LEAVEREQUEST.AUTHLRData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const rejectLRData = async (payload = {}) =>
  eportalRequest({
    url:  PORTALAPI.LEAVEREQUEST.REJECTLEAVEData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const deleteLRData = () => {};

export const getTBRList = async (payload = {}) =>
  eportalRequest({
    url:  PORTALAPI.LEAVEREQUEST.LR_LIST,
    method: "POST",
    dedupe: true,
    data: payload,
  });

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
    notifyWarning(`You can only select dates from ${firstDayOfCurrentMonth.format("DD-MMM-YYYY")} to ${lastAllowedDay.format("DD-MMM-YYYY")}`,"Selection not allowed");
    
    return false;
  }

  return true;
};

export const checkCL = (payload = {}) =>
  eportalRequest({
    url:  PORTALAPI.LEAVEREQUEST.CHECKCLDATA,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const checkOL = async (payload = {}) =>
  eportalRequest({
    url:  PORTALAPI.LEAVEREQUEST.CHECKOLDATA,
    method: "POST",
    dedupe: true,
    data: payload,
  });