import { hrmsRequest } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

export const getTenureChangeList = () =>
  hrmsRequest({
    url: HRMS_API.REPORTS.GET_TENURE_CHANGE_LIST,
    method: "GET",
    dedupe: true,
  });
