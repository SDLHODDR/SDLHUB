import { eportalRequest } from "../../../shared/services/request";
import { eportalAPI } from "../../../shared/services/api";
import { EPORTAL_API } from "../config/eportalApiConfig";
import { downloadFile } from "../../../shared/services/downloadFile";

/* Daily Timesheet (backend: api/eportal/timesheet/). Dates are "YYYY-MM-DD". */

export const getTimesheetDay = (date, { signal } = {}) =>
  eportalRequest({
    url: EPORTAL_API.TIMESHEET.GET_DAY,
    method: "POST",
    data: { date },
    signal,
  });

/* Reporting managers the logged-in employee can pick (their department). */
export const getTimesheetManagers = ({ signal } = {}) =>
  eportalRequest({
    url: EPORTAL_API.TIMESHEET.GET_MANAGERS,
    method: "GET",
    signal,
  });

/*
 * Saves a task. payload: { date, id?, categoryId, title, description,
 * taskStatus, remarks, reportTo, document?: File, removeDocument?: boolean }
 */
export const saveTimesheetTask = ({ document, removeDocument, ...fields }) => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  if (document) formData.append("document", document);
  if (removeDocument) formData.append("removeDocument", "1");

  return eportalRequest({
    url: EPORTAL_API.TIMESHEET.SAVE_TASK,
    method: "POST",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteTimesheetTask = (id) =>
  eportalRequest({
    url: EPORTAL_API.TIMESHEET.DELETE_TASK,
    method: "POST",
    data: { id },
  });

export const submitTimesheet = (date) =>
  eportalRequest({
    url: EPORTAL_API.TIMESHEET.SUBMIT,
    method: "POST",
    data: { date },
  });

/* Opens a task's document in a new tab (fetched with the login session). */
export const openTimesheetDocument = async (taskId) => {
  // Opened before the request so the browser does not block it as a pop-up.
  const tab = window.open("", "_blank");
  try {
    const response = await eportalAPI.get(EPORTAL_API.TIMESHEET.VIEW_DOCUMENT, {
      params: { id: taskId },
      responseType: "blob",
    });
    const url = URL.createObjectURL(response.data);
    if (tab) tab.location.href = url;
    else window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (error) {
    tab?.close();
    throw error;
  }
};

/* ---------- Daily Timesheet Report (reporting managers) ---------- */

/* filters: { from, to, empCode } - dates "YYYY-MM-DD"; empCode "" = everyone */
export const getTimesheetReport = (filters, { signal } = {}) =>
  eportalRequest({
    url: EPORTAL_API.TIMESHEET.GET_REPORT,
    method: "POST",
    data: filters,
    signal,
  });

/* Downloads the report for the same filters as an Excel file. */
export const exportTimesheetReport = async (filters) => {
  // The server's { status, message } error arrives as a blob; read its message.
  const blobMessage = async (blob) => {
    try {
      return JSON.parse(await blob.text())?.message;
    } catch {
      return "";
    }
  };

  let response;
  try {
    response = await eportalAPI.post(EPORTAL_API.TIMESHEET.EXPORT_REPORT, filters, { responseType: "blob" });
  } catch (error) {
    const data = error?.response?.data;
    const message = data instanceof Blob ? await blobMessage(data) : "";
    throw message ? new Error(message) : error;
  }

  if (response.data?.type?.includes("application/json")) {
    throw new Error((await blobMessage(response.data)) || "Unable to export the report.");
  }

  downloadFile(response, "Timesheet_Report.xlsx");
};
