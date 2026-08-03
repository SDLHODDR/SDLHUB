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

export const stripHtmlToText = (html) => {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};