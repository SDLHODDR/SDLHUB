import { eportalRequest } from "../../../shared/services/request"; // central handler
import { EPORTAL_API } from "../config/eportalApiConfig";

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
    url: EPORTAL_API.LEAVEREQUEST.LRData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const saveLRData = (payload = {}) =>
  eportalRequest({
    url: EPORTAL_API.LEAVEREQUEST.SAVELRData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const editLRData = () => {};

export const authLRData = async (payload = {}) =>
  eportalRequest({
    url:  EPORTAL_API.LEAVEREQUEST.AUTHLRData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const rejectLRData = async (payload = {}) =>
  eportalRequest({
    url:  EPORTAL_API.LEAVEREQUEST.REJECTLEAVEData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const getAuthLRSwipperData = async (payload = {}) =>
  eportalRequest({
    url:  EPORTAL_API.LEAVEREQUEST.LRSWIPEDATA,
    method: "POST",
    dedupe: true,
    data: payload,
  });  

export const getTBRList = async (payload = {}) =>
  eportalRequest({
    url:  EPORTAL_API.LEAVEREQUEST.LR_LIST,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const checkCL = (payload = {}) =>
  eportalRequest({
    url:  EPORTAL_API.LEAVEREQUEST.CHECKCLDATA,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const checkOL = async (payload = {}) =>
  eportalRequest({
    url:  EPORTAL_API.LEAVEREQUEST.CHECKOLDATA,
    method: "POST",
    dedupe: true,
    data: payload,
  });