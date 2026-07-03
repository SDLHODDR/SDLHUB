import { eportalAPI } from "../../../services/api";
import { EPORTAL_API } from "../config/eportalApiConfig";

/* ==========================================
   POLICY SUMMARY REPORT
========================================== */
export const getPolicyEndorsementReport = async () => {
  try {
    const response = await eportalAPI.get(
      EPORTAL_API.POLICY_ENDORSEMENT.GET_ENDORSEMENT_REPORT,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching policy endorsement report:",
      error
    );
    throw error;
  }
};

/* ==========================================
   POLICY ACCEPTANCE DETAILS
========================================== */
export const getPolicyAcceptanceDetails = async (
  policyId
) => {
  try {
    const response = await eportalAPI.post(
      EPORTAL_API.POLICY_ENDORSEMENT.GET_ACCEPTANCE_DETAILS,
      {
        policy_id: policyId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error fetching policy acceptance details:",
      error
    );

    throw error;
  }
};

/* ==========================================
   EXPORT POLICY ACCEPTANCE REPORT
========================================== */
export const exportPolicyAcceptanceReport = async (
    policyId
) => {
    const response = await eportalAPI.get(
        `${EPORTAL_API.POLICY_ENDORSEMENT.EXPORT_ACCEPTANCE_REPORT}?policy_id=${policyId}`,
        {
            responseType: "blob",
            withCredentials: true,
        }
    );

    return response.data;
};
