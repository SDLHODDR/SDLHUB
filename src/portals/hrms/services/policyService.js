import { hrmsRequest } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

export const getPolicyData = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MAINTAINANCE.POLICY_GET,
    method: "GET",
    params: payload,
  });
};

export const getCompanyMaster = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MAINTAINANCE.COMPANY_MASTER_GET,
    method: "GET",
    params: payload,
  });
};

export const getDepartmentMaster = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MAINTAINANCE.DEPARTMENT_MASTER_GET,
    method: "GET",
    params: payload,
  });
};

export const getDivisionMaster = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MAINTAINANCE.DIVISION_MASTER_GET,
    method: "GET",
    params: payload,
  });
};

// payload here is a FormData instance (policy includes a file upload),
// so we explicitly set multipart headers rather than relying on
// hrmsRequest's default JSON content-type.
export const savePolicy = async (payload) => {
  return hrmsRequest({
    url: HRMS_API.MAINTAINANCE.POLICY_SAVE,
    method: "POST",
    data: payload,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const publishPolicy = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MAINTAINANCE.POLICY_PUBLISH,
    method: "POST",
    data: payload,
  });
};