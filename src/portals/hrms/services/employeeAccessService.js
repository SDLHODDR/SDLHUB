import { hrmsRequest } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

/* ==========================================================
   GET EMPLOYEES
========================================================== */

export const getEmployeeAccessEmployees = async () => {
    return hrmsRequest({
        url: HRMS_API.MAINTAINANCE.GET_EMPLOYEES,
        method: "GET",
    });
};

/* ==========================================================
   GET EMPLOYEE ACCESS
========================================================== */

export const getEmployeeAccess = async (employee) => {
    return hrmsRequest({
        url: HRMS_API.MAINTAINANCE.GET_EMPLOYEE_ACCESS,
        method: "POST",
        data: {
            employee,
        },
    });
};

/* ==========================================================
   SAVE EMPLOYEE ACCESS
========================================================== */

export const saveEmployeeAccess = async ({
    employee,
    profileIds = [],
}) => {
    return hrmsRequest({
        url: HRMS_API.MAINTAINANCE.SAVE_EMPLOYEE_ACCESS,
        method: "POST",
        data: {
            employee,
            profileIds,
        },
    });
};

/* ==========================================================
   DISABLE EMPLOYEE ACCESS
========================================================== */

export const disableEmployeeAccess = async (id) => {
    return hrmsRequest({
        url: HRMS_API.MAINTAINANCE.DISABLE_EMPLOYEE_ACCESS,
        method: "POST",
        data: {
            id,
        },
    });
};