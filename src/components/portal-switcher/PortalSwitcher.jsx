import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  PORTALS,
  getPortalFromPath,
} from "../../config/portalConfig";

import {
  notifyError,
} from "../../services/alertService";

import { getHRMSConfigs } from "../../portals/hrms/services/orgonogramService";

const PortalSwitcher = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const activePortal = getPortalFromPath(location.pathname);
  const [loadingHRMSCnf, setLoadingHRMSCnf] = useState(false);

  const handleSwitch = (portalKey) => {

    const portal = PORTALS[portalKey];

    if (!portal) {
      return;
    }

    if (portal.key === activePortal.key) {
      return;
    }

    if(portal.key == "hrms"){
      console.log("portalKey", portal.key);
      console.log("activePortalKey", activePortal.key);

      const loadHRMSPortalConfigs = async () => {
        try {
          setLoadingHRMSCnf(true);

          const res = await getHRMSConfigs();
          if (res?.status) {
            const { COMP_ID_STR, DEPT_ID_STR, DIVISION_ID_STR } = res.data;

            const stringifyObj = JSON.stringify({
              COMP_ID: COMP_ID_STR,
              DEPT_ID: DEPT_ID_STR,
              DIVISION_ID: DIVISION_ID_STR,
            });

            console.log("=======RES==========", stringifyObj);

            // Store auth data
            localStorage.setItem("user-hrms-config", stringifyObj);
          }
        } catch (error) {
          console.error("Load HRMS configs error:", error);
          notifyError(error?.message || "Unable to load HRMS Configs.");
        } finally {
          setLoadingHRMSCnf(false);
        }
      };

      loadHRMSPortalConfigs();
    }
    
    navigate(portal.path);
  };

  return (
    <div className="portal-switcher">

      {Object.values(PORTALS).map((portal) => (

        <button
          key={portal.key}
          type="button"
          className={`portal-item ${
            activePortal.key === portal.key
              ? "active"
              : ""
          }`}
          onClick={() => handleSwitch(portal.key)}
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

        </button>

      ))}

    </div>
  );
};

export default PortalSwitcher;