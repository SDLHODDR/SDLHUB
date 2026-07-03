import { Navigate, useLocation } from "react-router-dom";

const PolicyGuard = ({ children }) => {
  const location = useLocation();

  const hasPendingPolicy =
    sessionStorage.getItem("HAS_PENDING_POLICY") === "true";

  /*
   Allow policy page itself
  */
  if (
    hasPendingPolicy &&
    location.pathname !== "/policy-acceptance"
  ) {
    return (
      <Navigate
        to="/policy-acceptance"
        replace
      />
    );
  }
  
  return children;
};

export default PolicyGuard;