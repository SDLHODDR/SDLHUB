import { request } from "./request";
import { PORTALAPI } from "./apiConfig";

/* ============================
   LOGIN
============================ */
export const login = (payload) =>
  request({
    url: PORTALAPI.AUTH.LOGIN,
    method: "POST",
    data: payload,
  });

/* ============================
   LOGOUT
============================ */
export const logoutAPI = () =>
  request({
    url: PORTALAPI.AUTH.LOGOUT,
    method: "POST",
  });

/* ============================
   SESSION CHECK (CRITICAL)
============================ */

let sessionPromise = null;

export const checkSession = () => {
  if (sessionPromise) {
    return sessionPromise;
  }

  sessionPromise = request({
    url: PORTALAPI.AUTH.SESSION_CHECK,
    method: "GET",
  })
    .catch((err) => {
      // Ignore cancelled requests
      if (err?.code === "ERR_CANCELED") {
        return null;
      }

      console.error("Session check failed:", err);
      return null;
    })
    .finally(() => {
      sessionPromise = null;
    });

  return sessionPromise;
};

/* ============================
   FORGOT PASSWORD
============================ */

export const forgotPassword = (payload) =>
  request({
    url: PORTALAPI.AUTH.FORGOT_PASSWORD,
    method: "POST",
    data: payload,
  });

/* ============================
   RESET PASSWORD
============================ */

export const resetPassword = (payload) =>
  request({
    url: PORTALAPI.AUTH.RESET_PASSWORD,
    method: "POST",
    data: payload,
  });

/* ============================
   VERIFY OTP
============================ */

export const verifyOtp = (payload) =>
  request({
    url: PORTALAPI.AUTH.VERIFY_OTP,
    method: "POST",
    data: payload,
  });

/* ============================
   NORMALIZE USER
============================ */

export const normalizeUser = (user) => ({
  name: user.NAME || user.name,
  role: user.ROLE || user.role || "User",
  empcode: user.EMP_CODE || user.emp_code,
  profile_image: user.PROFILE_IMAGE || user.profile_image,
});