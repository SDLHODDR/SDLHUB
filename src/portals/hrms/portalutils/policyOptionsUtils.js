import { normalizeRecords, getDisplayValue } from "../../../utils/formatUtils";

export const mapCompanyOptions = (payload) =>
  normalizeRecords(payload).map((item) => ({
    id: String(getDisplayValue(item, ["COMP_ID", "id"], "")),
    label: String(getDisplayValue(item, ["SH_DESC", "COMP_DESC", "label"], "-")),
  }));

export const mapDepartmentOptions = (payload) =>
  normalizeRecords(payload).map((item) => ({
    id: String(getDisplayValue(item, ["DEPT_ID", "id"], "")),
    label: String(getDisplayValue(item, ["DEPT_DESC", "label"], "-")),
  }));

export const mapDivisionOptions = (payload) =>
  normalizeRecords(payload).map((item) => ({
    id: String(getDisplayValue(item, ["DIVSN_ID", "id"], "")),
    label: String(getDisplayValue(item, ["DIVSN_DESC", "label"], "-")),
  }));

// PHP validated: pdf, doc, docx, jpeg, jpg, png, max 1MB
const ALLOWED_DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/jpg",
  "image/png",
];
const MAX_DOC_SIZE_BYTES = 1048576; // 1 MB

export const validateDocFile = (file) => {
  if (!file) return null;
  if (!ALLOWED_DOC_TYPES.includes(file.type)) {
    return "Only PDF, DOC/DOCX, or image files are allowed";
  }
  if (file.size > MAX_DOC_SIZE_BYTES) {
    return "Maximum upload size is 1 MB";
  }
  return null;
};