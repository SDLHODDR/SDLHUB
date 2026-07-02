import { eportalAPI } from "../../../services/api";
import { EPORTAL_API } from "../config/eportalApiConfig";

/* ---------------- GET PROFILES ---------------- */

export const getProfiles = async () => {
  try {
    const res = await eportalAPI.get(
      EPORTAL_API.PROFILE_MAINTENANCE.GET_PROFILES,
      { withCredentials: true }
    );

    return res.data;

  } catch (error) {
    console.error("Error fetching profile data:", error);
    throw error;
  }
};


/* ---------------- GET PROFILE ACCESS ---------------- */

export const getProfileAccess = async (profileId) => {
  try {
    const res = await eportalAPI.get(
      `${EPORTAL_API.PROFILE_MAINTENANCE.GET_PROFILE_ACCESS}?profile=${profileId}`,
      { withCredentials: true }
    );

    return res.data;

  } catch (error) {
    console.error("Error fetching profile access:", error);
    throw error;
  }
};


/* ---------------- SAVE MENU ---------------- */

export const saveMenu = async (payload) => {
  try {
    const res = await eportalAPI.post(
      EPORTAL_API.PROFILE_MAINTENANCE.SAVE_MENU,
      payload,
      { withCredentials: true }
    );

    return res.data;

  } catch (error) {
    console.error("Profile save menu error:", error);
    throw error;
  }
};


/* ---------------- SAVE TASK ---------------- */

export const saveTask = async (payload) => {
  try {
    const res = await eportalAPI.post(
      EPORTAL_API.PROFILE_MAINTENANCE.SAVE_TASK,
      payload,
      { withCredentials: true }
    );

    return res.data;

  } catch (error) {
    console.error("Profile save task error:", error);
    throw error;
  }
};


/* ---------------- SAVE DASH ---------------- */

export const saveDash = async (payload) => {
  try {
    const res = await eportalAPI.post(
      EPORTAL_API.PROFILE_MAINTENANCE.SAVE_DASH,
      payload,
      { withCredentials: true }
    );

    return res.data;

  } catch (error) {
    console.error("Profile save dashboard error:", error);
    throw error;
  }
};

/* ---------------- PROFILE USERS ---------------- */

export const getProfileUsers = async (profileId) => {
  try {
    const res = await eportalAPI.get(
      `${EPORTAL_API.PROFILE_MAINTENANCE.GET_PROFILE_USERS}?profileId=${profileId}`
    );

    return res.data;
  } catch (error) {
    console.error("Get Profile Users API Error:", error);
    throw error;
  }
};