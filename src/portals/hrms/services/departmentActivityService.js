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

/**
 * Creates a new Department Master record (used by the "Add new" flow in
 * SDLDropdownSelect when a user types a Department that doesn't exist yet).
 *
 * Expected PHP endpoint should insert via oci_bind_by_name (bound params),
 * matching the pattern already used elsewhere in the backend, and return
 * the created row's ID in the same shape as createKRAMaster:
 *   { status: true, message: "...", data: { DEPT_ID: "..." } }
 *
 * @param {{ DEPT_DESC: string }} payload
 * @returns {Promise<{status: boolean, message: string, data: {DEPT_ID: string}}>}
 */


export const createDepartmentMaster = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MAINTAINANCE.DEPARTMENTMASTER_SAVE,
    method: "POST",
    data: payload,
  });
};