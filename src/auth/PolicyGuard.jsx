import { Navigate, useLocation } from "react-router-dom";

const PolicyGuard = ({ children }) => {

  const location = useLocation();

  const hasPendingPolicy =
    sessionStorage.getItem("HAS_PENDING_POLICY") === "true";

   // Pending policy → force policy page
    if (hasPendingPolicy && location.pathname !== "/policy-acceptance") {
        return <Navigate to="/policy-acceptance" replace />;
    }

    // No pending policy → prevent revisiting policy page
    if (!hasPendingPolicy && location.pathname === "/policy-acceptance") {
        return <Navigate to="/eportal/dashboard" replace />;
    }

  return children;
};
export default PolicyGuard;