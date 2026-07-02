import { eportalAPI } from "../../../services/api";
import { EPORTAL_API } from "../config/eportalApiConfig";

export const getHolidays = async (year) => {
  try {
    const res = await eportalAPI.get(
      EPORTAL_API.HOLIDAYS.GET_HOLIDAYS,
      {
        params: { year },      
        withCredentials: true, // PHP session
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error fetching holidays:", error);
    throw error;
  }
};

// GET HOLIDAY RULES
export const getHolidayRules = async (year) => {
  try {  
    const res = await eportalAPI.get(
      EPORTAL_API.HOLIDAYS.GET_HOLIDAY_RULES,
      {
        params: { year },      
        withCredentials: true, // PHP session
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error fetching holidays:", error);
    throw error;
  }
};