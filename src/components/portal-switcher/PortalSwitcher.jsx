import { useLocation, useNavigate } from "react-router-dom";
import {
  PORTALS,
  getPortalFromPath,
} from "../../config/portalConfig";

const PortalSwitcher = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const activePortal = getPortalFromPath(location.pathname);

  const handleSwitch = (portalKey) => {

    const portal = PORTALS[portalKey];

    if (!portal) {
      return;
    }

    if (portal.key === activePortal.key) {
      return;
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