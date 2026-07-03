import { coreAPI } from "./api";
import { PORTALAPI } from "./apiConfig";

export const getProfile = async () => {
  const res = await coreAPI.get(
    PORTALAPI.PROFILE.GET_PROFILE_DATA,
    {
      withCredentials: true,
    }
  );

  return res.data;
};

export const getSalaryStructure = async () => {
  const res = await coreAPI.get(PORTALAPI.SALARY.GET, {
    withCredentials: true,
  });
  return res.data;
};

export const uploadProfileImage = async (formData) => {
    try {
        const res = await coreAPI.post(
            PORTALAPI.PROFILE.UPLOAD_PROFILE_IMAGE,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data", // override JSON
                },
            }
        );
        return res.data;
    } catch (error) {
        console.error("Upload Image API Error:", error);
        return { status: false, message: "Upload failed" };
    }
};

/* ============================
   SAVE FAMILY MEMBER
============================ */
export const saveFamilyMember = async (payload) => {
    try {
        const res = await coreAPI.post(
            PORTALAPI.PROFILE.SAVE_FAMILY_MEMBER,
            payload
        );

        return res.data;
    } catch (error) {
        console.error("Save family member error:", error);
        throw error;
    }
};

/* ============================
   DELETE FAMILY MEMBER
============================ */
export const deleteFamilyMember = async (payload) => {
    try {
        const res = await coreAPI.post(
            PORTALAPI.PROFILE.DELETE_FAMILY_MEMBER,
            payload
        );

        return res.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};



