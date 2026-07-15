import { eportalRequest } from "../../../services/request";
import { EPORTAL_API } from "../config/eportalApiConfig";

/* ============================
   GET EMPLOYEE ACCESS DROPDOWNS
============================ */

export const getEmployeeAccessDropdowns = () =>
  eportalRequest({
    url: EPORTAL_API.EMPLOYEE_ACCESS.GET_EMPLOYEE_ACCESS_DROPDOWNS,
    method: "GET",
    fallback: {
      status: false,
      companies: [],
      divisions: [],
      departments: [],
    },
  });

/* ============================
   GET EMPLOYEE ACCESS DATA
============================ */

export const getEmployeeAccessData = (payload) =>
  eportalRequest({
    url: EPORTAL_API.EMPLOYEE_ACCESS.GET_EMPLOYEE_ACCESS_DATA,
    method: "POST",
    data: payload,
  });

/* ============================
   SAVE EMPLOYEE PROFILES
============================ */

export const saveEmployeeProfiles = (payload) =>
  eportalRequest({
    url: EPORTAL_API.EMPLOYEE_ACCESS.SAVE_EMPLOYEE_PROFILES,
    method: "POST",
    data: payload,
    fallback: {
      status: false,
      message: "API Error",
    },
  });