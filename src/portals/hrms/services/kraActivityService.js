import { hrmsRequest } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

export const kraActivityFetchData = async () => {
  return hrmsRequest({
    url: HRMS_API.MAINTAINANCE.KRAACTIVITY_GET,
    method: "GET",
  });
};

export const getKRAMasterData = async () => {
   return hrmsRequest({
    url: HRMS_API.MAINTAINANCE.KRAMASTER,
    method: "GET",
  });
}

export const saveKRAActivity = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MAINTAINANCE.KRAACTIVITY_SAVE,
    method: "POST",
    data: payload,
  });
};

export const deleteKRAActivity = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MAINTAINANCE.KRAACTIVITY_DELETE,
    method: "POST",
    data: payload,
  });
};

/**
 * Creates a new KRA Master record (used by the "Add new" flow in
 * SDLDropdownSelect when a user types a KRA Master that doesn't exist yet).
 *
 * Expected PHP endpoint should insert via oci_bind_by_name (bound params),
 * matching the pattern already used elsewhere in the backend, and return
 * the created row (including its new KRA_ID) so the frontend can select it
 * immediately without a refetch.
 *
 * @param {{ KRA_DESC: string }} payload
 * @returns {Promise<object>} created record, e.g. { KRA_ID, KRA_DESC }
 */

export const createKRAMaster = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MAINTAINANCE.KRAMASTER_SAVE,
    method: "POST",
    data: payload,
  });
};