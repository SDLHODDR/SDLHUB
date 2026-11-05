import { coreRequest } from "../request";
import { PORTALAPI } from "../apiConfig";

/* =========================================================
   SEND PERSONAL DETAILS OTP
========================================================= */

export const sendPersonalDetailsOtp = (data) => {
  const formData = new FormData();

  formData.append("action", "send_otp");

  formData.append("cell", data?.cell || "");

  formData.append(
    "per_email",
    data?.per_email || "",
  );

  formData.append(
    "m_status",
    data?.m_status || "",
  );

  return coreRequest({
    url: PORTALAPI.PROFILE.SAVE_PERSONAL_DETAILS,
    method: "POST",
    data: formData,
  });
};

/* =========================================================
   VERIFY PERSONAL DETAILS OTP
========================================================= */

export const verifyPersonalDetailsOtp = (data) => {
  const formData = new FormData();

  formData.append("action", "verify_otp");

  formData.append(
    "request_id",
    data?.request_id || "",
  );

  formData.append(
    "otp",
    data?.otp || "",
  );

  return coreRequest({
    url: PORTALAPI.PROFILE.SAVE_PERSONAL_DETAILS,
    method: "POST",
    data: formData,
  });
};

/* =========================================================
   SAVE PERSONAL DETAILS
========================================================= */

export const savePersonalDetails = (data) => {
  const formData = new FormData();

  formData.append("action", "save_contact");

  formData.append(
    "request_id",
    data?.request_id || "",
  );

  formData.append(
    "cell",
    data?.cell || "",
  );

  formData.append(
    "per_email",
    data?.per_email || "",
  );

  formData.append(
    "m_status",
    data?.m_status || "",
  );

  return coreRequest({
    url: PORTALAPI.PROFILE.SAVE_PERSONAL_DETAILS,
    method: "POST",
    data: formData,
  });
};

/* =========================================================
   SAVE ADDRESS REQUEST
========================================================= */

export const saveAddressDetails = (data) => {
  const formData = new FormData();

  formData.append("action", "save_address");

  formData.append(
    "address",
    data?.address || ""
  );

  formData.append(
    "city",
    data?.city || ""
  );

  formData.append(
    "state",
    data?.state || ""
  );

  formData.append(
    "pincode",
    data?.pincode || ""
  );

  formData.append(
    "permnt_address",
    data?.permnt_address || ""
  );

  formData.append(
    "permnt_city",
    data?.permnt_city || ""
  );

  formData.append(
    "permnt_state",
    data?.permnt_state || ""
  );

  formData.append(
    "permnt_pincode",
    data?.permnt_pincode || ""
  );

  if (data?.address_proof) {
    formData.append(
      "address_proof",
      data.address_proof
    );
  }

  return coreRequest({
    url: PORTALAPI.PROFILE.SAVE_PERSONAL_DETAILS,
    method: "POST",
    data: formData,
  });
};


/* ============================
   PROFILE
============================ */

export const getProfile = () =>
  coreRequest({
    url: PORTALAPI.PROFILE.GET_PROFILE_DATA,
    method: "GET",
    dedupe: true,
    fallback: {},
  });

export const uploadProfileImage = (formData) =>
  coreRequest({
    url: PORTALAPI.PROFILE.UPLOAD_PROFILE_IMAGE,
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  export const saveBankDetails = payload =>
  coreRequest({
    url: PORTALAPI.PROFILE.SAVE_BANK_DETAILS,
    method: 'POST',
    data: payload
  });

  /* ============================
   FAMILY
============================ */

export const saveFamilyMember = (payload) =>
  coreRequest({
    url: PORTALAPI.PROFILE.SAVE_FAMILY_MEMBER,
    method: "POST",
    dedupe: true,
    data: payload,
  });

export const deleteFamilyMember = (payload) =>
  coreRequest({
    url: PORTALAPI.PROFILE.DELETE_FAMILY_MEMBER,
    method: "POST",
    dedupe: true,
    data: payload,
  });