import { coreAPI } from "./api";
import { PORTALAPI } from "./apiConfig";

/*
========================================
GET PENDING POLICIES
========================================
*/
export const getPendingPolicies = async () => {
    try {
        const response = await coreAPI.get(
            PORTALAPI.POLICY_ENDORSEMENT.GET_PENDING_POLICIES,
            {
                withCredentials: true,
            }
        );
        return response.data;

    } catch (error) {
        console.error("Get pending policies error:", error);
        throw error;
    }
};

/*
========================================
ACCEPT POLICY
========================================
*/
export const acceptPolicy = async (payload) => {

    try {
        const response = await coreAPI.post(
            PORTALAPI.POLICY_ENDORSEMENT.ACCEPT_POLICY,
            payload,
            {
                withCredentials: true,
            }
        );
        return response.data;

    } catch (error) {
        console.error("Accept policy error:", error);
        throw error;
    }
};
