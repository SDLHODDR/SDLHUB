import { hrmsRequest } from "../../../shared/services/request";

import { HRMS_API } from "../config/hrmsApiConfig";

// =====================================================
// EMPLOYEE DATA
// =====================================================

export const getEmployees = (params = {}) =>
  hrmsRequest({
    url: HRMS_API.EMPLOYEE.GET_EMPLOYEES,
    method: "GET",
    params,
  });

// Employees whose code or name contains every typed word (EmployeeSearchSelect).
export const searchEmployees = ({ q, status = "active" }) =>
  hrmsRequest({
    url: HRMS_API.EMPLOYEE.SEARCH,
    method: "GET",
    params: { q, status },
  });

// sections: the tabs' data to return (e.g. "employee", "office", "bank"); all when omitted.
export const getEmployeeById = (id, sections) =>
  hrmsRequest({
    url: HRMS_API.EMPLOYEE.GET_EMPLOYEE_BY_ID,
    method: "GET",
    params: sections ? { id, sections } : { id },
  });

// =====================================================
// EMPLOYEE MASTER DATA
// =====================================================

export const getEmployeeMasters = (type) =>
  hrmsRequest({
    url: HRMS_API.EMPLOYEE.GET_MASTERS,
    method: "GET",
    params: { type },
  });