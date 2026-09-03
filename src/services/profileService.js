import { coreRequest } from "./request";
import { PORTALAPI } from "./apiConfig";

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

/* ============================
   SALARY
============================ */

export const getSalaryStructure = () =>
  coreRequest({
    url: PORTALAPI.SALARY.GET,
    method: "GET",
    dedupe: true,
    fallback: {},
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

export const saveBankDetails = payload =>
  coreRequest({
    url: PORTALAPI.PROFILE.SAVE_BANK_DETAILS,
    method: 'POST',
    data: payload
  })

export const  sendPersonalDetailsOtp = formData =>
  coreRequest({
    url: PORTALAPI.PROFILE.SAVE_PERSONAL_DETAILS,
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

export const verifyPersonalDetailsOtp = ({ otp }) => {

  const formData = new FormData()

  formData.append('action', 'verify_otp')
  formData.append('otp', otp)

  return coreRequest({
    url: PORTALAPI.PROFILE.SAVE_PERSONAL_DETAILS,
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}