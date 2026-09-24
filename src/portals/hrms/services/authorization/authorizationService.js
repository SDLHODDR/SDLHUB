import { hrmsRequest } from "../../../../services/request";
import { HRMS_API } from "../../config/hrmsApiConfig";

/* ---------------- GET FAMILY AUTHORIZATION DETAILS ---------------- */
export const getFamilyAuthorizationDetails = (params) =>
  hrmsRequest({
    url: HRMS_API.AUTHORIZATION?.GET_FAMILY_DETAILS,
    method: "GET",
    dedupe: true,
    params,
    fallback: {
      status: false,
      data: null,
    },
  });

/* ---------------- SUBMIT FAMILY AUTHORIZATION DECISION ---------------- */
export const processFamilyAuthorization = (payload) =>
  hrmsRequest({
    url: HRMS_API.AUTHORIZATION?.PROCESS_FAMILY_DECISION,
    method: "POST",
    dedupe: true,
    data: payload,
    fallback: {
      status: false,
      message: "Unable to process authorization request.",
    },
  });

  /* ---------------- GET BANK AUTHORIZATION DETAILS ---------------- */
export const getBankAuthorizationDetails = (params) =>
  hrmsRequest({
    url: HRMS_API.AUTHORIZATION?.AUTHORIZE_BANK_DETAILS, 
    method: "GET",
    dedupe: true,
    params,
    fallback: {
      status: false,
      data: null,
    },
  });

/* ---------------- SUBMIT BANK AUTHORIZATION DECISION ---------------- */
export const processBankAuthorization = (payload) =>
  hrmsRequest({
    url: HRMS_API.AUTHORIZATION?.AUTHORIZE_BANK_DETAILS,
    method: "POST",
    dedupe: true,
    data: payload,
    fallback: {
      status: false,
      message: "Unable to process bank authorization request.",
    },
  });

  /* ---------------- GET PERSONAL INFO / ADDRESS DETAILS ---------------- */
export const getPersonalInfoAuthorizationDetails = (params) =>
  hrmsRequest({
    url: HRMS_API.AUTHORIZATION?.AUTHORIZE_PERSONAL_INFO,
    method: "GET",
    dedupe: true,
    params,
    fallback: {
      status: false,
      data: null,
    },
  });

/* ---------------- SUBMIT PERSONAL INFO / ADDRESS DECISION ---------------- */
export const processPersonalInfoAuthorization = (payload) =>
  hrmsRequest({
    url: HRMS_API.AUTHORIZATION?.AUTHORIZE_PERSONAL_INFO,
    method: "POST",
    dedupe: true,
    data: payload,
    fallback: {
      status: false,
      message: "Unable to process address authorization request.",
    },
  });