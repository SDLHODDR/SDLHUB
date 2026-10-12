import { hrmsRequest } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

export const sendTenureChangeForAuth = (empCode, managerCode) =>
  hrmsRequest({
    url: HRMS_API.REPORTS.SEND_TENURE_CHANGE,
    method: "POST",
    data: {
      generateTenure: true,
      EMP_CODE: empCode,
      MGR_CODE: managerCode,
    },
  });
export const getTenureChangeList = () =>
  hrmsRequest({
    url: HRMS_API.REPORTS.GET_TENURE_CHANGE_LIST,
    method: "GET",
    dedupe: true,
  });

export const getTenureChangeEmpById = (employeeId) =>
  hrmsRequest({
    url: HRMS_API.REPORTS.GET_TENURE_CHANGE_LIST_BY_ID,
    method: "GET",
    params: employeeId ? { id: employeeId } : {},
    dedupe: true,
  });

export const saveTenureChangeAssessment = (payload) =>
  hrmsRequest({
    url: HRMS_API.REPORTS.SAVE_TENURE_CHANGE_ASSESSMENT,
    method: "POST",
    data: { ...payload, saveConfirmation: true },
  });

export const submitTenureChangeAssessment = (payload) => {
  const submitPayload = { ...payload };
  delete submitPayload.saveConfirmation;

  return hrmsRequest({
    url: HRMS_API.REPORTS.SAVE_TENURE_CHANGE_ASSESSMENT,
    method: "POST",
    data: { ...submitPayload, CloseConfirmInt: true },
  });
};

export const getTenureChangeDetails = ({
  empCode,
  taskId,
  tenureChangeId,
} = {}) =>
  hrmsRequest({
    url: HRMS_API.REPORTS.GET_TENURE_CHANGE_DETAILS,
    method: "GET",
    params: {
      REC_ID: empCode ?? "",
      TASK_ID: taskId ?? "",
      TENURE_CHANGE_ID: tenureChangeId ?? "",
    },
    dedupe: false,
  });
