import { eportalRequest } from "../../../services/request";
import { EPORTAL_API } from "../config/eportalApiConfig";

/* ============================
   DOWNLOAD ITR DOCUMENTS ZIP
============================ */

export const downloadDocuments = (payload) =>
  eportalRequest({
    url: EPORTAL_API.DOWNLOAD_ITR.DOWNLOAD_ITR_DOCUMENT,
    method: "POST",
    data: payload,
  });

/* ============================
   DOWNLOAD ITR DECLARATIONS
============================ */

export const downloadDeclarations = (payload) =>
  eportalRequest({
    url: EPORTAL_API.DOWNLOAD_ITR.DOWNLOAD_ITR_DECLARAION,
    method: "POST",
    data: payload,
  });

/* ============================
   GET EMPLOYEE DROPDOWN
============================ */

export const getEmployeeDropdown = () =>
  eportalRequest({
    url: EPORTAL_API.DOWNLOAD_ITR.GET_EMPLOYEE_DROPDOWN,
    method: "GET",
    fallback: {
      status: false,
      data: [],
    },
  });