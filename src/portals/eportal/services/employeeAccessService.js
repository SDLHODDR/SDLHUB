import { eportalAPI } from "../../../services/api";
import { EPORTAL_API } from "../config/eportalApiConfig";

export const getEmployeeAccessDropdowns = async () => {
  try {
    const res = await eportalAPI.get(
      EPORTAL_API.EMPLOYEE_ACCESS.GET_EMPLOYEE_ACCESS_DROPDOWNS,
      {
        withCredentials: true // important if using PHP session
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error fetching Employee Access dropdown data:", error);
    throw error;
  }
};

export const getEmployeeAccessData = async (payload) => {
  try {
    const res = await eportalAPI.post(   
       EPORTAL_API.EMPLOYEE_ACCESS.GET_EMPLOYEE_ACCESS_DATA,
      payload,
      { withCredentials:true }
    );
    return res.data;

  } catch(err){
    console.error("Employee Access API error", err);
    throw err;
  }
};

/* ================= SAVE EMPLOYEE ACCESS ================= */

export const saveEmployeeProfiles = async (payload) => {
  try {

    const res = await eportalAPI.post(
      EPORTAL_API.EMPLOYEE_ACCESS.SAVE_EMPLOYEE_PROFILES,
      payload,
      { withCredentials:true }
    );

    return res.data;

  } catch(err){

    console.error("Employee Access API error", err);

    return {
      status:false,
      message:"API Error"
    };

  }
};

