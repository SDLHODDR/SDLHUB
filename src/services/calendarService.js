import { eportalAPI } from "./api";
import { PORTALAPI } from "./apiConfig";

/* ---------------------------
   CALENDAR APIs
---------------------------- */

export const getCalendarData = async () => {
  try {
    const res = await eportalAPI.get(PORTALAPI.CALENDAR.GET);
    return res?.data?.menu || [];
  } catch (error) {
    console.error("Calendar API error (GET):", error);
    return [];
  }
};

export const getCurrentHolidays = async () => {
  try {
    const res = await eportalAPI.get(PORTALAPI.CALENDAR.CURRENT);
    return res?.data?.menu || [];
  } catch (error) {
    console.error("Calendar API error (CURRENT):", error);
    return [];
  }
};

export const getUpcomingHolidays = async () => {
  try {
    const res = await eportalAPI.get(PORTALAPI.CALENDAR.UPCOMING);
    return res?.data?.menu || [];
  } catch (error) {
    console.error("Calendar API error (UPCOMING):", error);
    return [];
  }
};

export const getTotalBalLeavesData = async () => {
  try {
    const res = await eportalAPI.get(PORTALAPI.CALENDAR.LEAVEBALNCE);
    return res?.data || [];
  } catch (error) {
    console.error("Calendar API error (LEAVE BALANCE):", error);
    return [];
  }
};
