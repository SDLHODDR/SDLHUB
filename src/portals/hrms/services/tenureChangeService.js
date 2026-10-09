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
