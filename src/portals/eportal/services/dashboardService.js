import { eportalRequest } from "../../../services/request";
import { EPORTAL_API } from "../config/eportalApiConfig";

/* ---------------------------
   API CALLS
---------------------------- */

export const getAttendanceLog = (date) =>
  eportalRequest({
    url: EPORTAL_API.DASHBOARD.ATTENDANCE_LOG,
    method: "GET",
    params: { date },
    dedupe: true,
    fallback: { records: [] },
  });

export const getLast10DaysAttendance = () =>
  eportalRequest({
    url: EPORTAL_API.DASHBOARD.ATTENDANCE_10_DAYS,
    method: "GET",
    dedupe: true,
    fallback: { records: [] },
  });

export const getLeaveSummary = () =>
  eportalRequest({
    url: EPORTAL_API.DASHBOARD.LEAVE_SUMMARY,
    method: "GET",
    dedupe: true,
    fallback: [],
  });

export const getWorkSummary = () =>
  eportalRequest({
    url: EPORTAL_API.DASHBOARD.WORK_SUMMARY,
    method: "GET",
    dedupe: true,
    fallback: {},
  });

export const getUpcomingBirthdays = () =>
  eportalRequest({
    url: EPORTAL_API.DASHBOARD.BIRTHDAYS,
    method: "GET",
    dedupe: true,
    fallback: {},
  });

export const getITRemarks = () =>
  eportalRequest({
    url: EPORTAL_API.DASHBOARD.IT_REMARKS,
    method: "GET",
    dedupe: true,
    fallback: null,
  });

export const getDashboardAlerts = () =>
  eportalRequest({
    url: EPORTAL_API.DASHBOARD.ALERTS,
    method: "GET",
    dedupe: true,
    fallback: {
      alerts: [],
      meetings: [],
    },
  });

export const getDashboardAccessData = () =>
  eportalRequest({
    url: EPORTAL_API.DASHBOARD.ACCESS_DATA,
    method: "GET",
    dedupe: true,
    fallback: {
      records: [],
    },
  });

/* ---------------------------
   DASHBOARD AGGREGATOR
---------------------------- */

export const getDashboardData = async () => {
  const [
    dashAccessData,
    attendanceLog,
    workSummary,
    leaveSummary,
    birthdays,
    itRemarks,
    alertsRes,
  ] = await Promise.all([
    getDashboardAccessData(),
    getAttendanceLog(),
    getWorkSummary(),
    getLeaveSummary(),
    getUpcomingBirthdays(),
    getITRemarks(),
    getDashboardAlerts(),
  ]);

  const alertsData = alertsRes?.data || {};

  return {
    dashAccessData: dashAccessData?.data || {},
    attendanceLog: attendanceLog?.data || {},
    workSummary: workSummary?.data || {},
    leaveSummary: leaveSummary?.data || [],
    birthdays: birthdays?.data || {},
    itRemarks: itRemarks?.data,
    alerts: alertsData?.alerts || [],
    meetings: alertsData?.meetings || [],
    _last10Days: getLast10DaysAttendance().then(
      res => res?.data || []
    ),
  };
};