/* Current portal key = first URL segment (/hrms/... -> "hrms"). Used to pick PORTAL_RULES. */
export const currentPortal = () => {
  try {
    return window.location.pathname.split("/").filter(Boolean)[0] || "";
  } catch {
    return "";
  }
};
