import { hrmsRequest } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

/**
 * Get Application Error Logs
 */
export const getErrorLogs = async (logDate = null) => {
    return hrmsRequest({
        url: HRMS_API.LOGS.GET_ERROR_LOGS,
        method: "POST",
        dedupe: true,
        data: {
            logDate,
        },
        fallback: {
            status: false,
            logs: [],
            total: 0,
            logDate: "",
            message: "Unable to fetch error logs.",
        },
    });
};