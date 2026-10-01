import { telegramPSRAPI } from "../../../services/api";
import { PORTALAPI } from "../../../services/apiConfig";

export const getMembers = async (payload = {}) => {
  const res = await telegramPSRAPI.get(
    PORTALAPI.TELEGRAM.MEMBERS.LIST,
    {
      withCredentials: true,
      params: payload,
    }
  );

  return res.data || [];
};

export const getGroupMembers = async (payload = {}) => {
  const res = await telegramPSRAPI.post(
    PORTALAPI.TELEGRAM.MEMBERS.GROUP_MEMBERS,
    payload,
    {
      withCredentials: true,      
    }
  );

  return res.data || [];
};

export const saveMemberDM = async (payload) => {
  const res = await telegramPSRAPI.post(
    PORTALAPI.TELEGRAM.MEMBERS.SAVE_DM,
    payload,
    {
      withCredentials: true,
    }
  );

  return res.data || {};
};

export const addMember = async (payload) => {
  const res = await telegramPSRAPI.post(
  PORTALAPI.TELEGRAM.MEMBERS.CREATE,
  payload,
  {
    withCredentials: true
  }
  );

  return res.data || { data: [], total: 0 };
};

export const assignMemberToGroups = async (payload) => {
  const res = await telegramPSRAPI.post(
    PORTALAPI.TELEGRAM.MEMBERS.ASSIGN_GROUPS,
    payload,
    {
      withCredentials: true
    }
  );

  return res.data || { data: [], total: 0 };
};

export const getPSRDataDetails = async (payload = {}) => {
  const res = await telegramPSRAPI.post(
    PORTALAPI.TELEGRAM.MEMBERS.MEMBER_GROUPS,
    payload,
    {
      withCredentials: true
    }
  );
  
  return res.data || { data: [], total: 0 };
};

export const getPSRMembers = async (payload = {}) => {
  const res = await telegramPSRAPI.post(
    PORTALAPI.TELEGRAM.MEMBERS.LIST_REGION,
    payload,
    {
      withCredentials: true
    }
  );
  return res.data;
  //return res.data || { data: [], total: 0 };
};

export const getHRMSMembers = async (payload = {}) => {
  const res = await telegramPSRAPI.post(
    PORTALAPI.TELEGRAM.GROUPS.HRMS_MEMBERS,
    payload,
    {
      withCredentials: true
    }
  );
  return res.data;
  //return res.data || { data: [], total: 0 };
};

export const getPSRGRPDataDetails = async (payload = {}) => {
  const res = await telegramPSRAPI.get(
    PORTALAPI.TELEGRAM.MEMBERS.LIST,
    {
      withCredentials: true,
      params: payload,
    }
  );
  
  return res;
  //return res.data || { data: [], total: 0 };
};

export const deleteMember = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Member deleted successfully",
      });
    }, 500);
  });
};

// services/telegramService.js

export const getGroups = async (payload = {}) => {
  const res = await telegramPSRAPI.post(
    PORTALAPI.TELEGRAM.GROUPS.LIST,
    payload,
    {
      withCredentials: true
    }
  );
  
  return res.data || { data: [], total: 0 };
};

export const sendDirectMessage =
  async (payload) => {

    const res =
      await telegramPSRAPI.post(
        PORTALAPI.TELEGRAM.MEMBERS.SAVE_DM,
        payload,
        {
          withCredentials: true,
        }
      );

    return res.data;
};