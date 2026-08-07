import { request } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

export const getCapabilities = async (payload = {}) => {
  return request({
    url: HRMS_API.MAINTAINANCE.CAPABILITIES_GET,
    method: "GET",
    params: payload,
  });
};

export const saveCapabilities = async (payload = {}) => {
  return request({
    url: HRMS_API.MAINTAINANCE.CAPABILITIES_SAVE,
    method: "POST",
    data: payload,
  });
};
