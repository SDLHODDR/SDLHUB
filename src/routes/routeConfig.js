// routeConfig.js

import { publicRoutes } from "./publicRoutes";
import { commonRoutes } from "./commonRoutes";
import { eportalRoutes } from "./eportalRoutes";
import { eppRoutes } from "./eppRoutes";
import { sfmRoutes } from "./sfmRoutes";
import { hrmsRoutes } from "./hrmsRoutes";

export const routeConfig = {
  public: publicRoutes,

  protected: [
    ...commonRoutes,
    ...eportalRoutes,
    ...eppRoutes,
    ...sfmRoutes,
    ...hrmsRoutes,
  ],
};
