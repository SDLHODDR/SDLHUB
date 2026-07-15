import { request } from "./request";
import { PORTALAPI } from "./apiConfig";

/* ========================================
   GET PENDING POLICIES
======================================== */

export const getPendingPolicies = () =>
  request({
    url: PORTALAPI.POLICY_ENDORSEMENT.GET_PENDING_POLICIES,
    method: "GET",
    dedupe: true,
    fallback: [],
  });

/* ========================================
   ACCEPT POLICY
======================================== */

export const acceptPolicy = (payload) =>
  request({
    url: PORTALAPI.POLICY_ENDORSEMENT.ACCEPT_POLICY,
    method: "POST",
    data: payload,
  });