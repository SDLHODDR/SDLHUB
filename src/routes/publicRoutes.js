import Login from "../auth/Login";
import ForgotPassword from "../auth/ForgotPassword";

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
