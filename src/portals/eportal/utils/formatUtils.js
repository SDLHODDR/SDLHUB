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