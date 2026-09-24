const READ_ONLY_STATUSES = new Set([
  "T",
  "A",
  "AUTH",
  "AUTHORIZE",
  "AUTHORIZED",
  "TRANSIT",
  "IN TRANSIT",
]);

const REJECTED_STATUSES = new Set(["R", "REJECT", "REJECTED"]);

export const normalizeOrganogramStatus = (status) => {
  const normalized = String(status ?? "").trim().toUpperCase();
  return normalized || "N";
};

export const isOrganogramReadOnly = (status) =>
  READ_ONLY_STATUSES.has(normalizeOrganogramStatus(status));

export const isOrganogramRejected = (status) =>
  REJECTED_STATUSES.has(normalizeOrganogramStatus(status));
