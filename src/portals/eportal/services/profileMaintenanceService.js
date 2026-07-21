import { eportalRequest } from "../../../services/request";
import { EPORTAL_API } from "../config/eportalApiConfig";

/* ---------------- GET PROFILES ---------------- */

export const getProfiles = () =>
  eportalRequest({
    url: EPORTAL_API.PROFILE_MAINTENANCE.GET_PROFILES,
    method: "GET",
    dedupe: true,
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
    dedupe: true,
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
    dedupe: true,
    data: payload,
  });

/* ---------------- SAVE TASK ---------------- */

export const saveTask = (payload) =>
  eportalRequest({
    url: EPORTAL_API.PROFILE_MAINTENANCE.SAVE_TASK,
    method: "POST",
    dedupe: true,
    data: payload,
  });

/* ---------------- SAVE DASH ---------------- */

export const saveDash = (payload) =>
  eportalRequest({
    url: EPORTAL_API.PROFILE_MAINTENANCE.SAVE_DASH,
    method: "POST",
    dedupe: true,
    data: payload,
  });

/* ---------------- GET PROFILE USERS ---------------- */

export const getProfileUsers = (profileId) =>
  eportalRequest({
    url: EPORTAL_API.PROFILE_MAINTENANCE.GET_PROFILE_USERS,
    method: "GET",
    dedupe: true,
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
    dedupe: true,
    data: payload,
  });