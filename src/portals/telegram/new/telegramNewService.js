import { telegramPSRAPI } from "../../../shared/services/api";
import { PORTALAPI } from "../../../shared/services/apiConfig";

export {
  createGroup,
  getCompanies,
  getDepartments,
  getDivisions,
  getGroups,
  saveBroadCastMessage,
} from "../services/telegramService";

export {
  getGroupMembers,
  getHRMSMembers,
  getMembers,
  saveMemberDM,
} from "../services/telegramMemberService";

export const generateEmployeeInvitations = async (payload = {}) => {
  const response = await telegramPSRAPI.post(
    PORTALAPI.TELEGRAM.INVITATIONS.GENERATE,
    payload,
    { withCredentials: true }
  );

  return response.data || {};
};

export const getMyEmployeeInvitations = async () => {
  const response = await telegramPSRAPI.get(
    PORTALAPI.TELEGRAM.INVITATIONS.MINE,
    { withCredentials: true }
  );

  return response.data || {};
};