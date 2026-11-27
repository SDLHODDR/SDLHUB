export const TELEGRAM_ENABLED = import.meta.env.VITE_ENABLE_TELEGRAM !== "false";

// HRMS portal: on unless VITE_HRMS_ENABLED=false (e.g. an ePortal-only deployment). When off,
// the /hrms routes are not registered (they show Not Found) and HRMS is not in the portal
// switcher. The HRMS code stays in the project, so it is turned back on by the setting alone.
export const HRMS_ENABLED = import.meta.env.VITE_HRMS_ENABLED !== "false";