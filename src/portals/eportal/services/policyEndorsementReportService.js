import { eportalRequest } from "../../../services/request";
import { EPORTAL_API } from "../config/eportalApiConfig";
import { downloadFile } from "../../../services/downloadFile";

/* ==========================================
   POLICY SUMMARY REPORT
========================================== */

export const getPolicyEndorsementReport = () =>
  eportalRequest({
    url: EPORTAL_API.POLICY_ENDORSEMENT.GET_ENDORSEMENT_REPORT,
    method: "GET",
    dedupe: true,
    fallback: {
      status: false,
      data: [],
    },
  });

/* ==========================================
   POLICY ACCEPTANCE DETAILS
========================================== */

export const getPolicyAcceptanceDetails = (policyId) =>
  eportalRequest({
    url: EPORTAL_API.POLICY_ENDORSEMENT.GET_ACCEPTANCE_DETAILS,
    method: "POST",
    dedupe: true,
    data: {
      policy_id: policyId,
    },
  });

/* ==========================================
   EXPORT POLICY ACCEPTANCE REPORT
========================================== */

export const exportPolicyAcceptanceReport = async (policyId) => {
  const response = await eportalRequest({
    url: EPORTAL_API.POLICY_ENDORSEMENT.EXPORT_ACCEPTANCE_REPORT,
    method: "GET",
    dedupe: true,
    params: {
      policy_id: policyId,
    },
    responseType: "blob",
  });

  downloadFile(response, "Policy_Acceptance_Report.xlsx");
};