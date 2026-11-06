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

// A backend that accepts the request but never answers would otherwise leave the
// app on its loader. Past this, it continues as logged out and shows the login page.
const SESSION_CHECK_TIMEOUT_MS = 15000;

export const checkSession = () => {
  if (sessionPromise) {
    return sessionPromise;
  }

  sessionPromise = request({
    url: PORTALAPI.AUTH.SESSION_CHECK,
    method: "GET",
    timeout: SESSION_CHECK_TIMEOUT_MS,
  })
    .catch((err) => {
      // Ignore cancelled requests
      if (err?.status === 401) {
        return null;
      }

      if (err?.cancelled) {
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
   SESSION KEEPALIVE
============================ */
export const keepSessionAlive = () =>
  request({
    url: PORTALAPI.AUTH.SESSION_KEEPALIVE,
    method: "GET",
  });

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