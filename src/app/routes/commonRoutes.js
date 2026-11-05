// commonRoutes.js

import MyProfile from "../../shared/pages/MyProfile";
import PolicyAcceptance from "../../shared/pages/PolicyAcceptance";
import Profile from "../../shared/pages/profile/profile";

export const commonRoutes = [
  { path: "my-profile",  element: MyProfile, },
  { path: "policy-acceptance",  element: PolicyAcceptance, },
  { path: "profile", element: Profile },
];
