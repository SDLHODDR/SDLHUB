import { coreAPI, secureAPI } from "./api";
import { PORTALAPI } from "./apiConfig";

/* ============================
   LOGIN
============================ */
export const login = async (payload) => {
  try {
    const res = await secureAPI.post(PORTALAPI.AUTH.LOGIN, payload);
    return res.data;
  } catch (err) {
    console.error("Login API error:", err);
    throw err;
  }
};

/* ============================
   LOGOUT
============================ */
export const logoutAPI = async () => {
  try {
    const res = await secureAPI.post(PORTALAPI.AUTH.LOGOUT);
    return res.data;
  } catch (err) {
    console.error("Logout API error:", err);
    throw err;
  }
};

let sessionPromise = null;
/* ============================
   SESSION CHECK (CRITICAL)
============================ */
export const checkSession = async () => {
  // Prevent duplicate parallel calls
  if (sessionPromise) {
    return sessionPromise;
  }

  sessionPromise = secureAPI
    .get(PORTALAPI.AUTH.SESSION_CHECK)
    .then((res) => res.data)
    .catch((err) => {
      //  IMPORTANT: Ignore canceled requests
      if (err.code === "ERR_CANCELED") {
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
export const forgotPassword = async (payload) => {
  try {
    const res = await coreAPI.post(
      PORTALAPI.AUTH.FORGOT_PASSWORD,
      payload
    );
    return res.data;
  } catch (err) {
    console.error("Forgot password API error:", err);
    throw err;
  }
};

/* ============================
   RESET PASSWORD
============================ */
export const resetPassword = async (payload) => {
  try {
    const res = await secureAPI.post(
      PORTALAPI.AUTH.RESET_PASSWORD,
      payload
    );
    return res.data;
  } catch (err) {
    console.error("Reset password API error:", err);
    throw err;
  }
};

/* ============================
   VERIFY OTP
============================ */
export const verifyOtp = async (payload) => {
  try {
    const res = await secureAPI.post(
      PORTALAPI.AUTH.VERIFY_OTP,
      payload
    );
    return res.data;
  } catch (err) {
    console.error("Verify OTP API error:", err);
    throw err;
  }
};

/* ============================
   NORMALIZE USER
============================ */
export const normalizeUser = (user) => ({
  name: user.NAME || user.name,
  role: user.ROLE || user.role || "User",
  empcode: user.EMP_CODE || user.emp_code,
  profile_image: user.PROFILE_IMAGE || user.profile_image,
});
