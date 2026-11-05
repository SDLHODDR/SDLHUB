import Login from "../../shared/auth/Login";
import ForgotPassword from "../../shared/auth/ForgotPassword";

export const publicRoutes = [
  {
    path: "/login",
    element: Login,
  },
  {
    path: "/forgot-password",
    element: ForgotPassword,
  },
];
