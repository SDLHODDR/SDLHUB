import { eportalAPI } from "../../../services/api";
import { EPORTAL_API } from "../config/eportalApiConfig";

/* ---------------------------
   REQUEST CACHE (DEDUP)
---------------------------- */
const requestCache = new Map();

/* ---------------------------
   COMMON REQUEST HANDLER
---------------------------- */
const request = async (url, params = {}) => {
  const key = url + JSON.stringify(params);

  // RETURN SAME PROMISE IF ALREADY RUNNING
  if (requestCache.has(key)) {
    return requestCache.get(key);
  }

  const promise = (async () => {
    try {
      const res = await eportalAPI.get(url, {
        params,
        withCredentials: true,
      });

      // HANDLE CANCEL CASE
      if (!res || !res.data) {
        return null;
      }

      if (typeof res.data !== "object") {
        throw new Error("Invalid JSON response");
      }

      if (res.data.status === false) {
        throw new Error(res.data.message || "API error");
      }

      return res.data.data ?? res.data;

    } catch (error) {
      console.error(`Dashboard API Error → ${url}`, error);
      return null;
    } finally {
      // REMOVE FROM CACHE AFTER COMPLETE
      requestCache.delete(key);
    }
  })();

  requestCache.set(key, promise);
  return promise;
};

/* ---------------------------
   API CALLS
---------------------------- */
export const getAttendanceLog = (date) =>
  request(EPORTAL_API.DASHBOARD.ATTENDANCE_LOG, { date });

export const getLast10DaysAttendance = () =>
  request(EPORTAL_API.DASHBOARD.ATTENDANCE_10_DAYS);

export const getLeaveSummary = () =>
  request(EPORTAL_API.DASHBOARD.LEAVE_SUMMARY);

export const getWorkSummary = () =>
  request(EPORTAL_API.DASHBOARD.WORK_SUMMARY);

export const getUpcomingBirthdays = () =>
  request(EPORTAL_API.DASHBOARD.BIRTHDAYS);

export const getITRemarks = () =>
  request(EPORTAL_API.DASHBOARD.IT_REMARKS);

export const getDashboardAlerts = () =>
  request(EPORTAL_API.DASHBOARD.ALERTS);

export const getDashboardAccessData = () =>
  request(EPORTAL_API.DASHBOARD.ACCESS_DATA);

/* ---------------------------
   DASHBOARD AGGREGATOR
---------------------------- */
export const getDashboardData = async () => {
  try {

    const [
      dashAccessData,
      attendanceLog,
      workSummary,
      leaveSummary,
      birthdays,
      itRemarks,
      alertsRes
    ] = await Promise.all([
      getDashboardAccessData(),
      getAttendanceLog(),
      getWorkSummary(),
      getLeaveSummary(),
      getUpcomingBirthdays(),
      getITRemarks(),
      getDashboardAlerts()
    ]);

    // SLOW API → separate
    const last10DaysPromise = getLast10DaysAttendance();

    return {
      dashAccessData: dashAccessData || { records: [] },
      attendanceLog: attendanceLog || { records: [] },
      workSummary: workSummary || {},
      leaveSummary: leaveSummary || [],
      birthdays: birthdays || {},
      itRemarks: itRemarks || null,

      // FIX: extract properly
      alerts: alertsRes?.alerts || [],
      meetings: alertsRes?.meetings || [],

      _last10Days: last10DaysPromise
    };

  } catch (error) {
    console.error("Dashboard Load Failed", error);
    return null;
  }
};
