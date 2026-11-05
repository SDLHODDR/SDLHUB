import { coreRequest } from "../request";
import { PORTALAPI } from "../apiConfig";

/* ============================================================
   PERSONAL DETAILS SERVICE
   ============================================================ */

/**
 * Submit personal details request.
 *
 * This API:
 * 1. Checks whether an existing personal request is pending.
 * 2. If no pending request exists, creates a new request.
 * 3. Stores old and new values in HR_EMP_INFO_REQ.
 * 4. Generates/stores OTP.
 * 5. Returns the request details for OTP verification.
 *
 * The employee master is NOT updated at this stage.
 */
export const sendPersonalDetailsOtp = (formData) =>
  coreRequest({
    url: PORTALAPI.PROFILE.SAVE_PERSONAL_DETAILS,
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });


/**
 * Verify OTP for the personal details request.
 *
 * IMPORTANT:
 * After successful OTP verification, backend should:
 *
 * 1. Validate OTP
 * 2. Update employee master immediately
 * 3. Mark OTP_AUTH = 'Y'
 * 4. Keep HR_EMP_INFO_REQ as audit history
 */
export const verifyPersonalDetailsOtp = ({ otp, requestId = null }) => {
  const formData = new FormData();

  formData.append("action", "verify_otp");
  formData.append("otp", otp);

  if (requestId) {
    formData.append("request_id", requestId);
  }

  return coreRequest({
    url: PORTALAPI.PROFILE.SAVE_PERSONAL_DETAILS,
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};


/**
 * Get latest pending personal details request.
 *
 * Useful when:
 * - employee already has a request
 * - user opens the profile page again
 * - frontend needs to display old/new values
 */
export const getPendingPersonalDetails = () =>
  coreRequest({
    url: PORTALAPI.PROFILE.SAVE_PERSONAL_DETAILS,
    method: "POST",
    data: {
      action: "get_pending",
    },
    dedupe: true,
    fallback: null,
  });


/**
 * Optional resend OTP.
 *
 * Backend should create a new OTP for the latest pending request.
 */
export const resendPersonalDetailsOtp = ({ requestId = null } = {}) => {
  const formData = new FormData();

  formData.append("action", "resend_otp");

  if (requestId) {
    formData.append("request_id", requestId);
  }

  return coreRequest({
    url: PORTALAPI.PROFILE.SAVE_PERSONAL_DETAILS,
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};