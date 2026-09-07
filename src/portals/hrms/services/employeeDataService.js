import { hrmsRequest } from "../../../services/request";

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

export const getEmployeeById = (id) =>
  hrmsRequest({
    url: HRMS_API.EMPLOYEE.GET_EMPLOYEE_BY_ID,
    method: "GET",
    params: { id },
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