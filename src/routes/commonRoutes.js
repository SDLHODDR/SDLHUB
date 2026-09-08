// commonRoutes.js

import MyProfile from "../pages/MyProfile";
import PolicyAcceptance from "../pages/PolicyAcceptance";
import Profile from "../pages/profile/profile";

export const commonRoutes = [
  { path: "my-profile",  element: MyProfile, },
  { path: "policy-acceptance",  element: PolicyAcceptance, },
  { path: "profile", element: Profile },
];
