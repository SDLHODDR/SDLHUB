import { eportalRequest } from "../../../shared/services/request"; // central handler
import { EPORTAL_API } from "../config/eportalApiConfig";

export const getTBRDataDetails = (payload = {}) => 
  eportalRequest({
    url: EPORTAL_API.TICKETBOOKING.TBData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const ticketBookingFetchData = () => 
  eportalRequest({
    url: EPORTAL_API.TICKETBOOKING.GET_TB_LIST,
    method: "GET",
    dedupe: true,
    fallback: {
      status: false,
      data: [],
    },
  });

export const saveTBRData = (payload = {}) => 
  eportalRequest({
    url: EPORTAL_API.TICKETBOOKING.SAVETBData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const saveTBRDataAUTH = (payload = {}) => 
  eportalRequest({
    url: EPORTAL_API.TICKETBOOKING.SAVETBDataAuth,
    method: "POST",
    dedupe: true,
    data: payload,
  });
  
export const editTBRData = (payload = {}) => 
  eportalRequest({
    url: EPORTAL_API.TICKETBOOKING.EDITTBData,
    method: "POST",
    dedupe: true,
    data: payload,
  });
  
export const editTBRDataAUTH = (payload = {}) =>
  eportalRequest({
    url: EPORTAL_API.TICKETBOOKING.EDITTBDataAuth,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const authTBRData = (payload = {}) => 
  eportalRequest({
    url: EPORTAL_API.TICKETBOOKING.AUTHTBData,
    method: "POST",
    dedupe: true,
    data: payload,
  }); 

export const rejectTBRData = (payload = {}) =>
  eportalRequest({
    url: EPORTAL_API.TICKETBOOKING.REJECTTBData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const getTBRList = (payload = {}) =>
  eportalRequest({
    url: EPORTAL_API.TICKETBOOKING.TB_LIST,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const sendauthTBDataDetails = (payload = {}) =>
  eportalRequest({
    url: EPORTAL_API.TICKETBOOKING.SENDAUTHTBData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const closeTBTicket = (payload = {}) =>
  eportalRequest({
    url: EPORTAL_API.TICKETBOOKING.CLOSETBData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const resendauthTBDataDetails = (payload = {}) =>
  eportalRequest({
    url: EPORTAL_API.TICKETBOOKING.RESENDAUTHTBData,
    method: "POST",
    dedupe: true,
    data: payload,
  });