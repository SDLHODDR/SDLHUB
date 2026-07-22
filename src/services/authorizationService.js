import { eportalAPI } from "./api";
import { PORTALAPI } from "./apiConfig";

const csrfToken = sessionStorage.getItem("csrf_token");

/**
 * Fetch authrorization task data
 *
 */
export const getTaskTypesCountsData = async (payload = {}) => {
  try {
    const res = await eportalAPI.get(PORTALAPI.AUTHORIZATION.TASKDATA);

    // res.data.menu contains the array we need
    return res.data.tasks || [];
  } catch (error) {
    console.error("Authroization API error:", error);
    return [];
  }
};

export const getTaskTabsData = async (payload = {}) => {
  try {
    const res = await eportalAPI.get(PORTALAPI.AUTHORIZATION.TASKDATA);

    // res.data.menu contains the array we need
    return res.data.tasks || [];
  } catch (error) {
    console.error("Authroization API error:", error);
    return [];
  }
};

// export const getAuthLRSwipperData = async (payload = {}) => {
//   try {
//     const res = await eportalAPI.post(
//       PORTALAPI.LEAVEREQUEST.LRSWIPEDATA,
//       payload,
//       {
//         headers: {
//           "X-CSRF-Token": csrfToken
//         },
//         withCredentials: true
//       }
//     );

//     // res.data.menu contains the array we need
//     return res.data || [];
//   } catch (error) {
//     console.error("Authroization API error:", error);
//     return [];
//   }
// };

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