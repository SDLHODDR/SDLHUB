// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Badge from "../../portals/eportal/components/Badge";

const AuthorizationHRMSDropdown = () => {
    //const authState = useSelector((state) => state.hrmsAuthCounts.data);
    const successCnt = useSelector((state) => state.hrmsAuthCounts.success);
    const countTotalData = useSelector(
        (state) => state.hrmsAuthCounts.data.TOTAL_COUNT,
    );

    return (
      <div
        className="authorization-dropdown"
        style={{
            position: "relative",
        }}
        >
        {/* Bell Button */}
        <button
          type="button"
          className="nav-link btn btn-link p-0"
        >
          <i className="ti ti-bell"></i>

        {successCnt && (
          <Badge
            text={countTotalData}
            className="badge-danger"
          />
        )}
      </button>
    </div>
  );
};

export default AuthorizationHRMSDropdown;
