import { eportalRequest } from "../../../services/request";
import { EPORTAL_API } from "../config/eportalApiConfig";

/* ---------------------------
   HOLIDAYS
---------------------------- */

export const getHolidays = (year) =>
  eportalRequest({
    url: EPORTAL_API.HOLIDAYS.GET_HOLIDAYS,
    method: "GET",
    params: { year },

    fallback: {
      status: false,
      data: [],
    },
  });

/* ---------------------------
   HOLIDAY RULES
---------------------------- */

export const getHolidayRules = (year) =>
  eportalRequest({
    url: EPORTAL_API.HOLIDAYS.GET_HOLIDAY_RULES,
    method: "GET",
    params: { year },

    fallback: {
      status: false,
      data: [],
    },
  });