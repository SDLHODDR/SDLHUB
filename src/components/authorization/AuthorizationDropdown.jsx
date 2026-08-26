import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Badge from "../../portals/eportal/components/Badge";

const TASK_CONFIG = {
  109: { icon: "ti-inbox", badgeClass: "badge-danger", active: true },
  346: { icon: "ti-star", badgeClass: "badge-danger", active: false },
  349: { icon: "ti-rocket", badgeClass: "badge-danger", active: false },
  357: { icon: "ti-file", badgeClass: "badge-danger", active: false },
};

const DEFAULT_TASK_CONFIG = {
  icon: "fas fa-tasks",
  badgeClass: "",
  active: false,
};

const normalizeActivities = (tasks = []) =>
  tasks.map((task) => {
    const config = TASK_CONFIG[task.TASK_ID] || DEFAULT_TASK_CONFIG;

    return {
      href: `/eportal/taskauthorization/${task.TASK_ID}`,
      icon: config.icon,
      label: task.TASK_DESC,
      count: task.TOTAL,
      badgeClass: config.badgeClass,
      active: config.active,
    };
  });

const ActivityHeader = ({ open, onToggle }) => (
  <button
    type="button"
    className="d-flex align-items-center justify-content-between btn btn-link p-0 text-start text-decoration-none"
    style={{ fontWeight: 600, marginBottom: open ? "12px" : 0 }}
    onClick={onToggle}
  >
    <span>Activities</span>
    <i className={`ti ${open ? "ti-chevron-up" : "ti-chevron-down"}`}></i>
  </button>
);

const ActivityItem = ({ item, onNavigate }) => {
  const badgeClass = item.badgeClass
    ? `${item.badgeClass} badge-xs`
    : "text-gray";
  const itemClass = `d-flex align-items-center justify-content-between p-2 rounded ${item.active ? "active" : ""}`;

  return (
    <li>
      <Link to={item.href} className={itemClass} onClick={onNavigate}>
        <span className="d-flex align-items-center fw-medium">
          <i className={`ti ${item.icon} text-gray me-2`}></i>
          {item.label}
        </span>
        <Badge text={item.count} className={`shadow-none ${badgeClass}`} />
      </Link>
    </li>
  );
};

const AuthorizationDropdown = () => {
  const [bellOpen, setBellOpen] = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(true);
  const [authBellCount, setAuthBellCount] = useState(0);

  const wrapperRef = useRef(null);

  const authState = useSelector((state) => state.eportalAuthCounts.data);
  const successCnt = useSelector((state) => state.eportalAuthCounts.success);
  const countTotalData = useSelector(
    (state) => state.eportalAuthCounts.subtotal,
  );

  const activities = useMemo(() => normalizeActivities(authState), [authState]);

  const toggleBell = useCallback(() => {
    setBellOpen((prev) => !prev);
  }, []);

  const toggleActivities = useCallback(() => {
    setActivitiesOpen((prev) => !prev);
  }, []);

  // Close the dropdown after navigating to an activity
  const handleItemNavigate = useCallback(() => {
    setBellOpen(false);
  }, []);

  useEffect(() => {
    if (!bellOpen) {
      return undefined;
    }

    if (successCnt && countTotalData) {
      setAuthBellCount(countTotalData || 0);
    }

    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setBellOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [bellOpen, successCnt, countTotalData]);

  return (
    <div
      ref={wrapperRef}
      className="authorization-dropdown"
      style={{ position: "relative", marginRight: "14px" }}
    >
      {/* Bell Button */}
      <a
        href="#"
        role="button"
        className="nav-link btn btn-link p-0 position-relative"
        onClick={(e) => {
          e.preventDefault();
          toggleBell();
        }}
      >
        <i className="fas fa-tasks fs-22"></i>

        {successCnt > 0 && (
          <span
            className="badge rounded-pill bg-danger position-absolute"
            style={{
              top: "-10px",
              right: "-15px",
              fontSize: "10px",
              minWidth: "18px",
              height: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              lineHeight: 1,
              zIndex: 5,
            }}
          >
            {countTotalData}
          </span>
        )}
      </a>

      {/* Dropdown */}
      {bellOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 1050,
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
            minWidth: "260px",
            padding: "16px",
          }}
        >
          <ActivityHeader open={activitiesOpen} onToggle={toggleActivities} />

          {activitiesOpen && (
            <ul className="list-unstyled mb-0">
              {activities.length === 0 ? (
                <li className="p-2 text-gray">No activities</li>
              ) : (
                activities.map((item) => (
                  <ActivityItem
                    key={item.href}
                    item={item}
                    onNavigate={handleItemNavigate}
                  />
                ))
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthorizationDropdown;