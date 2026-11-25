import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  PORTALS,
  getPortalFromPath,
} from "../config/portalConfig";

import {
  notifyError,
} from "../services/alertService";

import { getHRMSConfigs } from "../../portals/hrms/services/orgonogramService";

// Store the user's HRMS company / department / division scope (read by the
// Organogram page). Runs whenever a tab enters HRMS, so a portal opened in a
// new tab gets it too, not only one switched to by a click.
const loadHRMSPortalConfigs = async () => {
  try {
    const res = await getHRMSConfigs();
    if (res?.status) {
      const { COMP_ID_STR, DEPT_ID_STR, DIVISION_ID_STR } = res.data;
      localStorage.setItem("user-hrms-config", JSON.stringify({
        COMP_ID: COMP_ID_STR,
        DEPT_ID: DEPT_ID_STR,
        DIVISION_ID: DIVISION_ID_STR,
      }));
    }
  } catch (error) {
    console.error("Load HRMS configs error:", error);
    notifyError(error?.message || "Unable to load HRMS Configs.");
  }
};

const isPlainLeftClick = (event) =>
  event.button === 0 &&
  !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;

// compact: the copy shown in the header on narrow screens (below 992px), where the
// full navbar is hidden. It skips the config load; the full switcher stays mounted.
const PortalSwitcher = ({ compact = false }) => {

  const location = useLocation();
  const activePortal = getPortalFromPath(location.pathname);

  useEffect(() => {
    if (!compact && activePortal.key === "hrms") {
      loadHRMSPortalConfigs();
    }
  }, [compact, activePortal.key]);

  return (
    <div className={`portal-switcher${compact ? " portal-switcher-compact" : ""}`}>

      {Object.values(PORTALS).map((portal) => (

        // A real link, so Ctrl/Cmd-click, middle-click and right-click
        // "Open in new tab" work.
        <Link
          key={portal.key}
          to={portal.path}
          title={portal.label}
          className={`portal-item ${
            activePortal.key === portal.key
              ? "active"
              : ""
          }`}
          onClick={(event) => {
            // A plain click on the portal already open does nothing (as before).
            if (portal.key === activePortal.key && isPlainLeftClick(event)) {
              event.preventDefault();
            }
          }}
        >

          <i
            className={
              portal.key === "eportal"
                ? "ti ti-user-circle"
                : portal.key === "epp"
                ? "ti ti-building-store"
                : portal.key === "sfm"
                ? "ti ti-chart-bar"
                : "ti ti-users"
            }
          />

          <span>{portal.label}</span>

        </Link>

      ))}

    </div>
  );
};

export default PortalSwitcher;
