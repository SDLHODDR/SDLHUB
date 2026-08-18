import { hrmsRequest } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

export const getOrgonograms = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_ORGANOGRAM_DATA,
    method: "POST",
    data: payload,
  });
};

export const getHRMSConfigs = () => 
  hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_HRMS_CONFIGS,
    method: "GET",
  });

export const getFinEntities = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_FIN_ENTITY,
    method: "POST",
    data: payload,
  });
};

export const getCompanies = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_COMPANY,
    method: "POST",
    data: payload,
  });
};

export const getDepartments = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_DEPARTMENT,
    method: "POST",
    data: payload,
  });
};

// Filtered by DEPARTMENT_ID
export const getDesignations = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_DESIGNATION,
    method: "POST",
    data: payload,
  });
};

// Filtered by DESIGNATION_ID
export const getJDLabels = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_JD_LABEL,
    method: "POST",
    data: payload,
  });
};

export const getDivisions = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_DIVISION,
    method: "POST",
    data: payload,
  });
};

export const getEmployeeLevels = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_EMPLOYEE_LEVEL,
    method: "POST",
    data: payload,
  });
};

export const getOrganogramLevels = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_ORGANOGRAM_LEVEL,
    method: "POST",
    data: payload,
  });
};

export const saveOrganogram = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.SAVE_ORGANOGRAM,
    method: "POST",
    data: payload,
  });
};

export const getOrganogramDetails = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MASTERDATA.GET_ORGANOGRAM_DETAILS,
    method: "POST",
    data: payload,
  });
};