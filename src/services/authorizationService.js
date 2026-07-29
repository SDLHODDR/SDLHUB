import { eportalAPI } from "./api";
import { PORTALAPI } from "./apiConfig";
import { eportalRequest } from "./request"; // central handler
import { EPORTAL_API } from "../portals/eportal/config/eportalApiConfig";

const csrfToken = sessionStorage.getItem("csrf_token");
/**
 * Fetch authrorization task data
 *
 */
export const getTaskTypesCountsData = async () => {
  try {
    const res = await eportalAPI.get(PORTALAPI.AUTHORIZATION.TASKDATA);

    // res.data.menu contains the array we need
    return res.data.tasks || [];
  } catch (error) {
    console.error("Authroization API error:", error);
    return [];
  }
};

export const fetchAuthorizationData = () =>
  eportalRequest({
    url: EPORTAL_API.AUTHORIZATION.TASKDATA,
    method: "GET",
    dedupe: true,
    fallback: {
      status: false,
      data: [],
    },
  });


export const getTaskTabsData = async () => {
  try {
    const res = await eportalAPI.get(PORTALAPI.AUTHORIZATION.TASKDATA);

    // res.data.menu contains the array we need
    return res.data.tasks || [];
  } catch (error) {
    console.error("Authroization API error:", error);
    return [];
  }
};

export const getTaskTableData = async (payload = {}) => {
  try {
    const res = await eportalAPI.post(
      PORTALAPI.AUTHORIZATION.TASKTABLEDATA,
      payload,
      {
        headers: {
          "X-CSRF-Token": csrfToken
        },
        withCredentials: true
      }
    );

    // res.data.menu contains the array we need
    return res.data.tasks || [];
  } catch (error) {
    console.error("Authroization API error:", error);
    return [];
  }
};