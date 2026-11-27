// routeConfig.js

import { publicRoutes } from "./publicRoutes";
import { commonRoutes } from "./commonRoutes";
import { eportalRoutes } from "../../portals/eportal/routes";
import { eppRoutes } from "../../portals/epp/routes";
import { sfmRoutes } from "../../portals/sfm/routes";
import { hrmsRoutes } from "../../portals/hrms/routes";
import { telegramRoutes } from "../../portals/telegram/routes";
import { HRMS_ENABLED } from "../../shared/config/featureFlags";

export const routeConfig = {
  public: publicRoutes,

  protected: [
    ...commonRoutes,
    ...eportalRoutes,
    ...eppRoutes,
    ...sfmRoutes,
    // Left out of an ePortal-only build (VITE_HRMS_ENABLED=false).
    ...(HRMS_ENABLED ? hrmsRoutes : []),
    ...telegramRoutes,
  ],
};
