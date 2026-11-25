import { eportalRequest } from "../../../shared/services/request"; // central handler
import { EPORTAL_API } from "../config/eportalApiConfig";

export const getGPDataDetails = (payload = {}) => 
  eportalRequest({
    url: EPORTAL_API.GATEPASS.GPData,
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

export const saveGPData = (payload = {}) => 
  eportalRequest({
    url: EPORTAL_API.GATEPASS.SAVEGPData,
    method: "POST",
    dedupe: true,
    data: payload,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const saveGPDataAUTH = (payload = {}) => 
  eportalRequest({
    url: EPORTAL_API.GATEPASS.SAVEGPDataAuth,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const authGPData = async (payload = {}) =>
  eportalRequest({
    url: EPORTAL_API.GATEPASS.AUTHGPData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const closeTaskData = async (payload = {}) =>
  eportalRequest({
    url: EPORTAL_API.GATEPASS.CLOSETASKGPData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const rejectGPData = (payload = {}) =>
  eportalRequest({
    url: EPORTAL_API.GATEPASS.REJECTGPData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const sendauthGPDataDetails = (payload = {}) =>
  eportalRequest({
    url: EPORTAL_API.GATEPASS.SENDAUTHGPData,
    method: "POST",
    dedupe: true,
    data: payload,
  });
  
export const closeGPTicket = (payload = {}) => 
  eportalRequest({
    url: EPORTAL_API.GATEPASS.CLOSEGPData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const resendauthGPDataDetails = (payload = {}) =>
  eportalRequest({
    url: EPORTAL_API.GATEPASS.RESENDAUTHGPData,
    method: "POST",
    dedupe: true,
    data: payload,
  });
