import Login from "../../shared/auth/Login";
import ForgotPassword from "../../shared/auth/ForgotPassword";
import CareersApp from "../../portals/careers/CareersApp";

export const publicRoutes = [
  {
    path: "/login",
    element: Login,
  },
  {
    path: "/forgot-password",
    element: ForgotPassword,
  },
  // Careers (candidate portal): own login and routes, not employee / profile based.
  {
    path: "/careers/*",
    element: CareersApp,
  },
];
