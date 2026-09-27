import { hrmsRequest } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

// Store the active in-flight promise
let menuRequestPromise = null;

export const getHrmsMenu = async () => {
  // If a request is already running, return the existing in-flight promise
  if (menuRequestPromise) {
    return menuRequestPromise;
  }

  // Create and track the promise
  menuRequestPromise = (async () => {
    try {
      const response = await hrmsRequest({
        url: HRMS_API.MENU.GET_MENU,
        method: "GET",
      });
      return response;
    } finally {
      // Reset the promise after a short cooldown so future intentional reloads can fetch fresh data
      setTimeout(() => {
        menuRequestPromise = null;
      }, 500);
    }
  })();

  return menuRequestPromise;
};