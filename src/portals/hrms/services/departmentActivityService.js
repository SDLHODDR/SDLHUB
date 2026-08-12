import { hrmsRequest } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

export const getDepartmentMaster = async (payload = {}) => {
    return hrmsRequest({
        url: HRMS_API.MAINTAINANCE.DEPTACTIVITY_DEPTMST_GET,
        method: "GET",
        params: payload,
    });
};

export const getDepartmentActivities = async (payload = {}) => {
    return hrmsRequest({
        url: HRMS_API.MAINTAINANCE.DEPTACTIVITY_FETCH,
        method: "GET",
        params: payload,
    });
};

export const saveDeptActivity = async (payload) => {
    return hrmsRequest({
        url: HRMS_API.MAINTAINANCE.DEPTACTIVITY_SAVE,
        method: "POST",
        data: payload,
    });
};

export const deleteDeptActivity = async (payload) => {
    return hrmsRequest({
        url: HRMS_API.MAINTAINANCE.DEPTACTIVITY_DELETE,
        method: "POST",
        data: payload,
    });
};