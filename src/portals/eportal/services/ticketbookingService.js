import { eportalRequest } from "../../../services/request"; // central handler
import { EPORTAL_API } from "../config/eportalApiConfig";
import { PORTALAPI } from "../../../services/apiConfig";

// export const getTBRDataDetails = async (payload = {}) => {
//   const res = await eportalAPI.post(
//     PORTALAPI.TICKETBOOKING.TBData,
//     payload,
//     {
//       // headers: {
//       //   "X-CSRF-Token": csrfToken
//       // },
//       withCredentials: true
//     }
//   );
  
//   return res.data.pass || [];
// };

export const getTBRDataDetails = (payload = {}) => 
  eportalRequest({
    url: PORTALAPI.TICKETBOOKING.TBData,
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
    url: PORTALAPI.TICKETBOOKING.SAVETBData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const saveTBRDataAUTH = (payload = {}) => 
  eportalRequest({
    url: PORTALAPI.TICKETBOOKING.SAVETBDataAuth,
    method: "POST",
    dedupe: true,
    data: payload,
  });
  
export const editTBRData = (payload = {}) => 
  eportalRequest({
    url: PORTALAPI.TICKETBOOKING.EDITTBData,
    method: "POST",
    dedupe: true,
    data: payload,
  });
  
export const editTBRDataAUTH = (payload = {}) =>
  eportalRequest({
    url: PORTALAPI.TICKETBOOKING.EDITTBDataAuth,
    method: "POST",
    dedupe: true,
    data: payload,
  });
 

export const authTBRData = (payload = {}) => 
  eportalRequest({
    url: PORTALAPI.TICKETBOOKING.AUTHTBData,
    method: "POST",
    dedupe: true,
    data: payload,
  }); 

export const rejectTBRData = (payload = {}) =>
  eportalRequest({
    url: PORTALAPI.TICKETBOOKING.REJECTTBData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const deleteTBRData = () => {};

export const getTBRList = (payload = {}) =>
  eportalRequest({
    url: PORTALAPI.TICKETBOOKING.TB_LIST,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const sendauthTBDataDetails = (payload = {}) =>
  eportalRequest({
    url: PORTALAPI.TICKETBOOKING.SENDAUTHTBData,
    method: "POST",
    dedupe: true,
    data: payload,
  });


export const closeTBTicket = (payload = {}) =>
  eportalRequest({
    url: PORTALAPI.TICKETBOOKING.CLOSETBData,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const resendauthTBDataDetails = (payload = {}) =>
  eportalRequest({
    url: PORTALAPI.TICKETBOOKING.RESENDAUTHTBData,
    method: "POST",
    dedupe: true,
    data: payload,
  });