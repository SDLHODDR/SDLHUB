//import { secureRequest } from "./request";

import { hrmsRequest } from "./request";
import { HRMS_API } from "../portals/hrms/config/hrmsApiConfig";

export const fetchNotifications = async () => {
    return hrmsRequest({
        url: HRMS_API.NOTIFICATIONS.LIST,
        method: "GET",
        dedupe: true,
    });
};

export const markNotificationRead = async (payload = {}) => {
    return hrmsRequest({
        url: HRMS_API.NOTIFICATIONS.MARK_READ,
        method: "POST",
        data: typeof payload === "object" ? payload : { ID: payload },
    });
}