import { eportalAPI } from "../../../services/api";
import { EPORTAL_API } from "../config/eportalApiConfig";

/* ============================
   GET INCOME + REGIME DATA
============================ */
export const getIncomeData = async () => {
  try {
    const res = await eportalAPI.get(
      EPORTAL_API.IT_RETURN.GET_INCOME_DATA,
      {
        withCredentials: true, // PHP session
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error fetching income data:", error);
    throw error;
  }
};

/* ============================
   GET DEDUCTION DATA
============================ */
export const getDeductionData = async () => {
  try {
    const res = await eportalAPI.get(
      EPORTAL_API.IT_RETURN.GET_DEDUCTION_DATA,
      {
        withCredentials: true, // PHP session
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error fetching income data:", error);
    throw error;
  }
};

/* ============================
   GET EXEMPTION DATA
============================ */
export const getExemptionData = async () => {
  try {
    const res = await eportalAPI.get(
      EPORTAL_API.IT_RETURN.GET_EXEMPTION_DATA,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error fetching income data:", error);
    throw error;
  }
};

/* ============================
   DELETE EXEMPTION DATA
============================ */
export const deleteExemptionData = async (id) => {
  try {
    const res = await eportalAPI.post(
      EPORTAL_API.IT_RETURN.DELETE_EXEMPTION,
      {
        exemption_id: id,
      }
    );

    return res.data;
  } catch (error) {
    console.error("Delete exemption error:", error);
    throw error;
  }
};

/* ============================
   SAVE REGIME
============================ */
export const saveRegime = async (payload) => {
  try {
    const res = await eportalAPI.post(
      EPORTAL_API.IT_RETURN.SAVE_REGIME,
      payload,
      {
        withCredentials: true, // PHP session
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error saving regime:", error);
    throw error;
  }
};

/* ============================
   SAVE OTHER INCOME
============================ */
export const saveOtherIncome = async (payload) => {
  try {
    const res = await eportalAPI.post(
      EPORTAL_API.IT_RETURN.SAVE_OTHER_INCOME,
      payload,
      {
        withCredentials: true, // PHP session
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error saving other income:", error);
    throw error;
  }
};

/* ============================
   SAVE DEDUCTIONS
============================ */
export const saveDeductions = async (payload) => {
  try {
    const res = await eportalAPI.post(
      EPORTAL_API.IT_RETURN.SAVE_DEDUCTIONS,
      payload,
      {
         headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error saving deductions:", error);
    throw error;
  }
};

/* ============================
   SAVE EXEMPTIONS (HRA)
============================ */
export const saveExemptions = async (payload) => {
  try {
    const res = await eportalAPI.post(
      EPORTAL_API.IT_RETURN.SAVE_EXEMPTIONS,
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data; // IMPORTANT
  } catch (error) {
    throw error;
  }
};

/* ============================
   SAVE FORM 12B
============================ */
export const saveForm12B = async (payload) => {
  try {
    const res = await eportalAPI.post(
      EPORTAL_API.IT_RETURN.SAVE_FORM_12B,
      payload,
      {
        withCredentials: true, // PHP session
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error saving Form 12B:", error);
    throw error;
  }
};

/* ============================
   GET PREVIEW DATA
============================ */
export const getPreviewData = async () => {
  try {
    const res = await eportalAPI.get(
      EPORTAL_API.IT_RETURN.GET_PREVIEW_DATA,
      {
        withCredentials: true, // PHP session
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error fetching preview data:", error);
    throw error;
  }
};

/* ============================
   GET Form12B DATA
============================ */
export const getForm12B = async () => {
  try {
    const res = await eportalAPI.get(
      EPORTAL_API.IT_RETURN.GET_FORM12B_DATA,
      {
        withCredentials: true, // PHP session        
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error fetching Form 12B data:", error);
    throw error;
  }
};

/* ============================
   GET Employee Summary
============================ */
export const getEmployeeSummary = async () => {
  try {
    const res = await eportalAPI.get(
      EPORTAL_API.IT_RETURN.GET_EMPLOYEE_SUMMARY
    );
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/* =============================================================
   GET Config Flag - wheather to open the window for employess
============================================================= */
export const getItReturnConfig = async () => {
  try {
    const res = await eportalAPI.get(
        EPORTAL_API.IT_RETURN.GET_CONFIG
    );
    return res.data;
   } catch (error) {
    console.error(error);
    throw error;
  }
};