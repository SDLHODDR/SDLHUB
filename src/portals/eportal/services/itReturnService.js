import { eportalRequest } from "../../../services/request";
import { EPORTAL_API } from "../config/eportalApiConfig";

/* ============================
   GET INCOME + REGIME DATA
============================ */

export const getIncomeData = () =>
  eportalRequest({
    url: EPORTAL_API.IT_RETURN.GET_INCOME_DATA,
    method: "GET",
    dedupe: true,
    fallback: {
      status: false,
      data: {},
    },
  });

/* ============================
   GET DEDUCTION DATA
============================ */

export const getDeductionData = () =>
  eportalRequest({
    url: EPORTAL_API.IT_RETURN.GET_DEDUCTION_DATA,
    method: "GET",
    dedupe: true,
    fallback: {
      status: false,
      data: {},
    },
  });

/* ============================
   GET EXEMPTION DATA
============================ */

export const getExemptionData = () =>
  eportalRequest({
    url: EPORTAL_API.IT_RETURN.GET_EXEMPTION_DATA,
    method: "GET",
    dedupe: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    fallback: {
      status: false,
      data: {},
    },
  });

/* ============================
   DELETE EXEMPTION DATA
============================ */

export const deleteExemptionData = (id) =>
  eportalRequest({
    url: EPORTAL_API.IT_RETURN.DELETE_EXEMPTION,
    method: "POST",
    dedupe: true,
    data: {
      exemption_id: id,
    },
  });

/* ============================
   SAVE REGIME
============================ */

export const saveRegime = (payload) =>
  eportalRequest({
    url: EPORTAL_API.IT_RETURN.SAVE_REGIME,
    method: "POST",
    data: payload,
    dedupe: true,
  });

/* ============================
   SAVE OTHER INCOME
============================ */

export const saveOtherIncome = (payload) =>
  eportalRequest({
    url: EPORTAL_API.IT_RETURN.SAVE_OTHER_INCOME,
    method: "POST",
    dedupe: true,
    data: payload,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

/* ============================
   SAVE DEDUCTIONS
============================ */

export const saveDeductions = (payload) =>
  eportalRequest({
    url: EPORTAL_API.IT_RETURN.SAVE_DEDUCTIONS,
    method: "POST",
    dedupe: true,
    data: payload,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

/* ============================
   SAVE EXEMPTIONS (HRA)
============================ */

export const saveExemptions = (payload) =>
  eportalRequest({
    url: EPORTAL_API.IT_RETURN.SAVE_EXEMPTIONS,
    method: "POST",
    dedupe: true,
    data: payload,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

/* ============================
   SAVE FORM 12B
============================ */

export const saveForm12B = (payload) =>
  eportalRequest({
    url: EPORTAL_API.IT_RETURN.SAVE_FORM_12B,
    method: "POST",
    dedupe: true,
    data: payload,
  });

/* ============================
   GET PREVIEW DATA
============================ */

export const getPreviewData = () =>
  eportalRequest({
    url: EPORTAL_API.IT_RETURN.GET_PREVIEW_DATA,
    method: "GET",
    dedupe: true,
    fallback: {
      status: false,
      data: {},
    },
  });

/* ============================
   GET FORM 12B DATA
============================ */

export const getForm12B = () =>
  eportalRequest({
    url: EPORTAL_API.IT_RETURN.GET_FORM12B_DATA,
    method: "GET",
    dedupe: true,
    fallback: {
      status: false,
      data: {},
    },
  });

/* ============================
   GET EMPLOYEE SUMMARY
============================ */

export const getEmployeeSummary = () =>
  eportalRequest({
    url: EPORTAL_API.IT_RETURN.GET_EMPLOYEE_SUMMARY,
    method: "GET",
    dedupe: true,
    fallback: {
      status: false,
      data: {},
    },
  });

/* =============================================================
   GET CONFIG FLAG - wheather to open the window for employess
============================================================= */

export const getItReturnConfig = () =>
  eportalRequest({
    url: EPORTAL_API.IT_RETURN.GET_CONFIG,
    method: "GET",
    dedupe: true,
    fallback: {
      status: false,
      data: {},
    },
  });