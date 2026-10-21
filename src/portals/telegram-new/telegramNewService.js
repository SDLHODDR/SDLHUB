import { telegramPSRAPI } from "../../services/api";
import { PORTALAPI } from "../../services/apiConfig";

export {
  createGroup,
  getCompanies,
  getDepartments,
  getDivisions,
  getGroups,
  saveBroadCastMessage,
} from "../telegram/services/telegramService";

export {
  getGroupMembers,
  getHRMSMembers,
  getMembers,
  saveMemberDM,
} from "../telegram/services/telegramMemberService";

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