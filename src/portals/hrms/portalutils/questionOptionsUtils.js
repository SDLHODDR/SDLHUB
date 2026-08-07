export const buildOptionsFromRow = (row) => {
  if (!row) return [];

  if (Array.isArray(row.OPTIONS) && row.OPTIONS.length) return row.OPTIONS;

  if (typeof row.OPTIONS === "string" && row.OPTIONS.trim() !== "") {
    return row.OPTIONS.split(",").map((s) => s.trim()).filter(Boolean);
  }

  const count = Number(row.noopts || row.NO_OF_OPTIONS || 0);
  if (count > 0) {
    return Array.from({ length: count }, (_, i) => row[`opts_${i + 1}`] || "");
  }

  return [];
};