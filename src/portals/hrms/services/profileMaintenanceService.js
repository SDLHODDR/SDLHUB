import { hrmsRequest } from "../../../shared/services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

export const getProfiles = () =>
  hrmsRequest({
    url: HRMS_API.MAINTAINANCE.GET_PROFILES,
    method: "GET",
  });

// section: "menu" | "company" | "division" | "department" | "task" | "dashboard"
// fetches only that tab's data; omit it for all tabs.
export const getProfileAccess = (profileId, section) =>
  hrmsRequest({
    url: HRMS_API.MAINTAINANCE.GET_PROFILE_ACCESS,
    method: "GET",
    params: section ? { profileId, section } : { profileId },
  });

export const saveProfileAccess = ({
  profileId,
  accessType,
  menuIds = [],
  subMenuIds = [],
  companyIds = [],
  divisionIds = [],
  departmentIds = [],
  taskIds = [],
  dashboardIds = [],
}) =>
  hrmsRequest({
    url: HRMS_API.MAINTAINANCE.SAVE_PROFILE_ACCESS,
    method: "POST",
    data: {
      profileId,
      accessType,
      menuIds,
      subMenuIds,
      companyIds,
      divisionIds,
      departmentIds,
      taskIds,
      dashboardIds,
    },
  });