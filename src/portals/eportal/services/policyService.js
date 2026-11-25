import { eportalRequest } from "../../../shared/services/request"; // central handler
import { EPORTAL_API } from "../config/eportalApiConfig";
import { getPolicyDocUrl } from "../../hrms/services/policyService";

// The APIs link documents to the old HRMS server, where files uploaded in SDL Hub do
// not exist. Open them through the policy document endpoint instead: it serves the
// file from this server, or sends older ones on to the old HRMS server.
const withDocUrls = (response) =>
  response?.status && Array.isArray(response.data)
    ? {
        ...response,
        data: response.data.map((policy) =>
          policy?.previewUrl && policy.policyId
            ? { ...policy, previewUrl: getPolicyDocUrl(policy.policyId) }
            : policy
        ),
      }
    : response;

/* ---------------------------
   POLICIES API
---------------------------- */
export const getPolicies = () =>
  eportalRequest({
    url: EPORTAL_API.POLICIES.GET_POLICIES,
    method: "GET",

    // IMPORTANT FIX
    isEportal: true,
    
    // prevents duplicate API calls (React StrictMode, re-renders, etc.)
    dedupe: true,

    // optional: cache result for some time (fast navigation)
    cache: true,
    cacheTime: 5 * 60 * 1000, // 5 minutes

    // fallback if API fails or canceled
    fallback: {
      status: false,
      data: []
    }
  }).then(withDocUrls);

export const getActivePolicies = () =>
  eportalRequest({
    url: EPORTAL_API.POLICIES.GET_ACTIVE_POLICIES,
    method: "GET",

    // IMPORTANT FIX
    isEportal: true,
    
    // prevents duplicate API calls (React StrictMode, re-renders, etc.)
    dedupe: true,

    // optional: cache result for some time (fast navigation)
    cache: true,
    cacheTime: 5 * 60 * 1000, // 5 minutes

    // fallback if API fails or canceled
    fallback: {
      status: false,
      data: []
    }
  }).then(withDocUrls);