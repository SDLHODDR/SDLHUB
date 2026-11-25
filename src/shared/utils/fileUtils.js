/* True for a PDF File (by MIME type or .pdf extension). */
export const isPdfFile = (file) =>
  file?.type === "application/pdf" || Boolean(file?.name?.toLowerCase().endsWith(".pdf"));
