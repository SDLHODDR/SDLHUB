import { request } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

export const kraActivityFetchData = async () => {
  return request({
    url: HRMS_API.MAINTAINANCE.KRAACTIVITY_GET,
    method: "GET",
  });
};

export const getKRAMasterData = async () => {
  return request({
    url: HRMS_API.MAINTAINANCE.KRAMASTER,
    method: "GET",
  });
}

export const saveKRAActivity = async (payload = {}) => {
  return request({
    url: HRMS_API.MAINTAINANCE.KRAACTIVITY_SAVE,
    method: "POST",
    data: payload,
  });
};

export const deleteKRAActivity = async (payload = {}) => {
  return request({
    url: HRMS_API.MAINTAINANCE.KRAACTIVITY_DELETE,
    method: "POST",
    data: payload,
  });
};