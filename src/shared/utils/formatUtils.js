export const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    
    const date = new Date(dateStr);
    if (isNaN(date)) return "-";

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export const formatDashDate = (dateStr) => {
    if (!dateStr) return "-";
    
    const date = new Date(dateStr);
    if (isNaN(date)) return "-";

    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleDateString("en-GB", { month: "short" });
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
};

export const stripHtmlToText = (html) => {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};
/* Fixed month names: toLocaleDateString("en-GB", { month: "short" }) gives
   "Sept" for September in newer browsers, which the backend does not expect. */
const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* Date (or date string) -> "05-Sep-2026"; "" when empty or invalid. */
export const toDMYDate = (value) => {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date)) return "";
    return `${String(date.getDate()).padStart(2, "0")}-${SHORT_MONTHS[date.getMonth()]}-${date.getFullYear()}`;
};

/* JS Date -> "YYYY-MM-DD" (form/calendar value); "" when not a valid Date. */
export const toISODate = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return "";
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

/* "YYYY-MM-DD" -> JS Date (local time), or null. */
export const isoToDate = (value) => {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return isNaN(date.getTime()) ? null : date;
};
