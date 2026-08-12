import { hrmsRequest } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

export const getOrgonograms = () =>
  hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_ORGANOGRAM_DATA,
    method: "GET",
  });

export const getHRMSConfigs = () => 
  hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_HRMS_CONFIGS,
    method: "GET",
  });