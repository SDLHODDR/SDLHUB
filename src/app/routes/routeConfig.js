// routeConfig.js

import { publicRoutes } from "./publicRoutes";
import { commonRoutes } from "./commonRoutes";
import { eportalRoutes } from "../../portals/eportal/routes";
import { eppRoutes } from "../../portals/epp/routes";
import { sfmRoutes } from "../../portals/sfm/routes";
import { hrmsRoutes } from "../../portals/hrms/routes";
import { telegramRoutes } from "../../portals/telegram/routes";

export const routeConfig = {
  public: publicRoutes,

  protected: [
    ...commonRoutes,
    ...eportalRoutes,
    ...eppRoutes,
    ...sfmRoutes,
    ...hrmsRoutes,
    ...telegramRoutes,
  ],
};
