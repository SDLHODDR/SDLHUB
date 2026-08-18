import { hrmsAPI } from "../../../services/api";
import { request } from "../../../services/request";
import {HRMS_API} from "../config/hrmsApiConfig"

// Fetch departments list or details
export const getDepartmentMasterData = (params = {}) =>
  request({
    api: hrmsAPI,
    url: HRMS_API.MAINTAINANCE.DEPARTMENT,
    method: "GET",
    params,
  });

// Save or update a department. Payload shape is passed through to backend.
export const saveDepartment = (payload) =>
  request({
    api: hrmsAPI,
    url: HRMS_API.MAINTAINANCE.DEPARTMENT,
    method: "POST",
    data: payload,
  });

// Delete department. Many backends expect an action flag; include it here for safety.
export const deleteDepartment = (payload) =>
  request({
    api: hrmsAPI,
    url: HRMS_API.MAINTAINANCE.DEPARTMENT,
    method: "POST",
    data: {
      ...payload,
      action: "delete",
    },
  });

// -------------------------
// Department - Designation Map
// -------------------------
export const getDepartmentDesignationMap = (params = {}) =>
  request({
    api: hrmsAPI,
    url: HRMS_API.MAINTAINANCE.DEPT_DESIGNATION_GET,
    method: "GET",
    params,
  });

export const saveDepartmentDesignationMap = (payload = {}) =>
  request({
    api: hrmsAPI,
    url: HRMS_API.MAINTAINANCE.DEPT_DESIGNATION_SAVE,
    method: "POST",
    data: payload,
  });

export const deleteDepartmentDesignationMap = (payload = {}) =>
  request({
    api: hrmsAPI,
    url: HRMS_API.MAINTAINANCE.DEPT_DESIGNATION_DELETE,
    method: "POST",
    data: payload,
  });

export const getDesignationsMaster = (params = {}) =>
  request({
    api: hrmsAPI,
    url: HRMS_API.MAINTAINANCE.DESIGNATIONS_MASTER,
    method: "GET",
    params,
  });

  export const getAccountCodes = () =>
  request({
    api: hrmsAPI,
    url: HRMS_API.MAINTAINANCE.DEPARTMENT,
    method: "GET",
    params: {
      type: "accounts",
    },
  });

  export const getCostCenters = (acctCode) =>
  request({
    api: hrmsAPI,
    url: HRMS_API.MAINTAINANCE.DEPARTMENT,
    method: "GET",
    params: {
      type: "costcenters",
      acct_code: acctCode,
    },
  });