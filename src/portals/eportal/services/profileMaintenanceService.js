import { eportalRequest } from "../../../services/request";
import { EPORTAL_API } from "../config/eportalApiConfig";

/* ---------------- GET PROFILES ---------------- */

export const getProfiles = () =>
  eportalRequest({
    url: EPORTAL_API.PROFILE_MAINTENANCE.GET_PROFILES,
    method: "GET",
    fallback: {
      status: false,
      data: [],
    },
  });

/* ---------------- GET PROFILE ACCESS ---------------- */

export const getProfileAccess = (profileId) =>
  eportalRequest({
    url: EPORTAL_API.PROFILE_MAINTENANCE.GET_PROFILE_ACCESS,
    method: "GET",
    params: { profile: profileId },
    fallback: {
      status: false,
      menu: [],
      task: [],
      dash: [],
    },
  });

/* ---------------- SAVE MENU ---------------- */

export const saveMenu = (payload) =>
  eportalRequest({
    url: EPORTAL_API.PROFILE_MAINTENANCE.SAVE_MENU,
    method: "POST",
    data: payload,
  });

/* ---------------- SAVE TASK ---------------- */

export const saveTask = (payload) =>
  eportalRequest({
    url: EPORTAL_API.PROFILE_MAINTENANCE.SAVE_TASK,
    method: "POST",
    data: payload,
  });

/* ---------------- SAVE DASH ---------------- */

export const saveDash = (payload) =>
  eportalRequest({
    url: EPORTAL_API.PROFILE_MAINTENANCE.SAVE_DASH,
    method: "POST",
    data: payload,
  });

/* ---------------- GET PROFILE USERS ---------------- */

export const getProfileUsers = (profileId) =>
  eportalRequest({
    url: EPORTAL_API.PROFILE_MAINTENANCE.GET_PROFILE_USERS,
    method: "GET",
    params: { profileId },
    fallback: {
      status: false,
      data: [],
    },
  });

/* ---------------- ADD PROFILE ---------------- */

export const addProfile = (payload) =>
  eportalRequest({
    url: EPORTAL_API.PROFILE_MAINTENANCE.ADD_PROFILE,
    method: "POST",
    data: payload,
  });