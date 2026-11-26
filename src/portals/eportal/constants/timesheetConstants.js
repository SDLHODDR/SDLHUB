/*
 * Daily Timesheet. Limits are the column sizes in
 * sdlhub-backend/database/eportal/timesheet.sql (in characters);
 * the backend (timesheet/tsCommon.php) checks the same values.
 */

export const TS_LIMITS = {
  TITLE: 200,
  DESCRIPTION: 1000,
  REMARKS: 500,
};

/* Task document: same types and size as the backend (tsCommon.php). */
export const TS_DOCUMENT = {
  MAX_BYTES: 2 * 1024 * 1024,
  MAX_LABEL: "2 MB",
  EXTENSIONS: ["pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png"],
  TYPES_LABEL: "PDF, Word, Excel, JPG or PNG",
};

export const TS_TASK_STATUS_OPTIONS = [
  { value: "C", label: "Completed" },
  { value: "P", label: "In Progress" },
  { value: "H", label: "On Hold" },
];

/* Badge colour per day status (D Draft, S Submitted, A Approved, R Rejected). */
export const TS_DAY_STATUS_BADGE = {
  D: "bg-warning",
  S: "bg-info",
  A: "bg-success",
  R: "bg-danger",
};

export const TS_TASK_STATUS_BADGE = {
  C: "bg-success",
  P: "bg-info",
  H: "bg-secondary",
};
