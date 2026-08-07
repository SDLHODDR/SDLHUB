import { hrmsRequest } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

export const getProfiles = () =>
  hrmsRequest({
    url: HRMS_API.MAINTAINANCE.GET_PROFILES,
    method: "GET",
  });

export const getProfileAccess = (profileId) =>
  hrmsRequest({
    url: HRMS_API.MAINTAINANCE.GET_PROFILE_ACCESS,
    method: "GET",
    params: {
      profileId,
    },
  });

export const saveProfileAccess = ({
  profileId,
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
      menuIds,
      subMenuIds,
      companyIds,
      divisionIds,
      departmentIds,
      taskIds,
      dashboardIds,
    },
  });