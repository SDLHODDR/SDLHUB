import { hrmsRequest } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

export const getCapabilities = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MAINTAINANCE.CAPABILITIES_GET,
    method: "GET",
    params: payload,
  });
};

export const saveCapabilities = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MAINTAINANCE.CAPABILITIES_SAVE,
    method: "POST",
    data: payload,
  });
};

/**
 * Creates a new Capabilities Code master record (used by the "Add new"
 * flow in SDLDropdownSelect when a user types a code that doesn't exist
 * yet).
 *
 * Unlike KRA Master / Department Master, Capabilities has no separate
 * numeric ID — the CODE itself is the identifier — so the endpoint should
 * insert the code and return it back rather than a generated *_ID.
 *
 * Expected PHP endpoint should insert via oci_bind_by_name (bound params),
 * matching the pattern already used elsewhere in the backend, and return:
 *   { status: true, message: "...", data: { CAPA_CODE: "..." } }
 *
 * @param {{ CAPA_CODE: string }} payload
 * @returns {Promise<{status: boolean, message: string, data: {CAPA_CODE: string}}>}
 */

export const createCapabilityMaster = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MAINTAINANCE.CAPABILITIES_MASTER_SAVE,
    method: "POST",
    data: payload,
  });
};
