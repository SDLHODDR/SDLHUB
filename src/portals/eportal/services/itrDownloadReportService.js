import { eportalRequest } from "../../../services/request";
import { downloadFile } from "../../../services/downloadFile";
import { EPORTAL_API } from "../config/eportalApiConfig";

/* ==========================================
   GET ITR DOWNLOAD REPORT
========================================== */

export const getItrDownloadReport = (filters) =>
  eportalRequest({
    url: EPORTAL_API.ITR_DOWNLOAD_REPORT.GET_REPORT,
    method: "POST",
    data: filters,
    fallback: {
      success: false,
      message: "Failed to fetch report",
      data: [],
      summary: {},
    },
  });

/* ==========================================
   EXPORT ITR DOWNLOAD REPORT
========================================== */

export const exportItrDownloadReport = async (filters) => {
  const response = await eportalRequest({
    url: EPORTAL_API.ITR_DOWNLOAD_REPORT.EXPORT_REPORT,
    method: "POST",
    data: filters,
    responseType: "blob",
  });

  downloadFile(response, "ITR_Download_Report.xlsx");
};