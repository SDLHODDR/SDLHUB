import { eportalRequest } from "../../../services/request";
import { EPORTAL_API } from "../config/eportalApiConfig";

/**
 * Get Application Error Logs
 */
export const getErrorLogs = async (logDate = null) => {
    return eportalRequest({
        url: EPORTAL_API.LOGS.GET_ERROR_LOGS,
        method: "POST",
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