import { eportalRequest } from "../../../services/request";
import { EPORTAL_API } from "../config/eportalApiConfig";

/* ---------------------------
   GET ATTENDANCE
---------------------------- */

export const getAttendance = (month) =>
  eportalRequest({
    url: EPORTAL_API.ATTENDANCE.GET_ATTENDANCE,
    method: "GET",
    dedupe: true,
    params: { month },

    fallback: {
      status: false,
      data: null,
    },
  });