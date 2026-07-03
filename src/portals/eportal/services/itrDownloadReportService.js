import { eportalAPI } from "../../../services/api";
import { EPORTAL_API } from "../config/eportalApiConfig";

/* ==========================================
   GET ITR DOWNLOAD REPORT
========================================== */
export const getItrDownloadReport = async (filters) => {
  try {
    const response = await eportalAPI.post(
      EPORTAL_API.ITR_DOWNLOAD_REPORT.GET_REPORT,
      filters,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching ITR Download Report:", error);

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        "Failed to fetch report",
      data: [],
      summary: {},
    };
  }
};

/* ==========================================
   EXPORT ITR DOWNLOAD REPORT
========================================== */
export const exportItrDownloadReport = async (filters) => {
  try {
    const response = await eportalAPI.post(
      EPORTAL_API.ITR_DOWNLOAD_REPORT.EXPORT_REPORT,
      filters,
      {
        responseType: "blob",
      }
    );

    const contentDisposition =
      response.headers["content-disposition"];

    let fileName = "ITR_Download_Report.xlsx";

    if (contentDisposition) {
      const match = contentDisposition.match(
        /filename="?([^"]+)"?/i
      );

      if (match && match[1]) {
        fileName = match[1];
      }
    }

    const blob = new Blob(
      [response.data],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Error exporting ITR Download Report:",
      error
    );

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        "Failed to export report",
    };
  }
};