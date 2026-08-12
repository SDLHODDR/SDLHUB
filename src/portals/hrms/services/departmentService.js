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
