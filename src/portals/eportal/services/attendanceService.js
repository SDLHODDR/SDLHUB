import { eportalAPI } from "../../../services/api";
import { EPORTAL_API } from "../config/eportalApiConfig";

/** * Fetch attendance by month (YYYY-MM) 
 * * @param {string} month - format: 2026-03 */

export const getAttendance = async (month) => {
  try {
    const res = await eportalAPI.get(
      EPORTAL_API.ATTENDANCE.GET_ATTENDANCE,
      {
        params: { month },
        withCredentials: true,
      }
    );

    // HANDLE NULL RESPONSE (from cancel)
    if (!res || !res.data) {
      return { status: false, data: null };
    }

    return res.data;

  } catch (error) {
    console.error("Error fetching attendance:", error);
    return { status: false, data: null };
  }
};
