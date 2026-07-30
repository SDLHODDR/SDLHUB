import { eportalRequest } from "../../../services/request";
import { EPORTAL_API } from "../config/eportalApiConfig";

/* ============================
   GET EMPLOYEE ACCESS DROPDOWNS
============================ */

/*export const getEmployeeAccessDropdowns = (companyId = "") =>
  eportalRequest({
    url: EPORTAL_API.EMPLOYEE_ACCESS.GET_EMPLOYEE_ACCESS_DROPDOWNS,
    method: "GET",
    params: companyId
      ? {
          company_id: companyId,
        }
      : {},
    fallback: {
      status: false,
      data: {
        companies: [],
        divisions: [],
        departments: [],
        employees: [],
      },
    },
  });*/

 export const getEmployeeAccessDropdowns = ({
  companyId = "",
  divisionId = "",
  departmentId = "",
} = {}) =>
  eportalRequest({
    url: EPORTAL_API.EMPLOYEE_ACCESS.GET_EMPLOYEE_ACCESS_DROPDOWNS,
    method: "POST",
    data: {
      company_id: companyId,
      division_id: divisionId,
      department_id: departmentId,
    },
    fallback: {
      status: false,
      data: {
        companies: [],
        divisions: [],
        departments: [],
        employees: [],
      },
    },
  });
  
/* ============================
   GET EMPLOYEE ACCESS DATA
============================ */

export const getEmployeeAccessData = (payload) =>
  eportalRequest({
    url: EPORTAL_API.EMPLOYEE_ACCESS.GET_EMPLOYEE_ACCESS_DATA,
    method: "POST",
    dedupe: true,
    data: payload,
  });

/* ============================
   SAVE EMPLOYEE PROFILES
============================ */

export const saveEmployeeProfiles = (payload) =>
  eportalRequest({
    url: EPORTAL_API.EMPLOYEE_ACCESS.SAVE_EMPLOYEE_PROFILES,
    method: "POST",
    dedupe: true,
    data: payload,
    fallback: {
      status: false,
      message: "API Error",
    },
  });