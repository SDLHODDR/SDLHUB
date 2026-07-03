import { eportalAPI } from "../../../services/api";
import { EPORTAL_API } from "../config/eportalApiConfig";

/* ============================
   DOWNLOAD ITR DOCUMENTS ZIP
=============================== */
export const downloadDocuments = async (payload) => {
  try {
    const res = await eportalAPI.post(
      EPORTAL_API.DOWNLOAD_ITR.DOWNLOAD_ITR_DOCUMENT,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;

  } catch (error) {
    console.error("Error downloading ITR docs:", error);
    throw error;
  }
};

export const downloadDeclarations = async (payload) => {
  try {
    const res = await eportalAPI.post(
      EPORTAL_API.DOWNLOAD_ITR.DOWNLOAD_ITR_DECLARAION,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;

  } catch (error) {
    console.error("Error downloading ITR docs:", error);
    throw error;
  }
};


export const getEmployeeDropdown = async () => {
  try {
    const res = await eportalAPI.get(
      EPORTAL_API.DOWNLOAD_ITR.GET_EMPLOYEE_DROPDOWN,
      {
        withCredentials: true // important if using PHP session
      }
    );
    return res.data;

  } catch (error) {
    console.error("Error fetching Employee dropdown data:", error);
    throw error;
  }
};
