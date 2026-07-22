import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";

const TASK_CONFIG = {
  109: { icon: "ti-inbox", badgeClass: "badge-danger", active: true },
  346: { icon: "ti-star", badgeClass: "", active: false },
  349: { icon: "ti-rocket", badgeClass: "", active: false },
  357: { icon: "ti-file", badgeClass: "", active: false },
};

const DEFAULT_TASK_CONFIG = {
  icon: "ti-bell",
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

const ActivityItem = ({ item }) => {
  const badgeClass = item.badgeClass ? `${item.badgeClass} badge-xs` : "text-gray";
  const itemClass = `d-flex align-items-center justify-content-between p-2 rounded ${item.active ? "active" : ""}`;

  return (
    <li>
      <a href={item.href} className={itemClass}>
        <span className="d-flex align-items-center fw-medium">
          <i className={`ti ${item.icon} text-gray me-2`}></i>
          {item.label}
        </span>
        <span className={`badge shadow-none rounded-pill ${badgeClass}`}>{item.count}</span>
      </a>
    </li>
  );
};

const AuthorizationDropdown = () => {
  const [bellOpen, setBellOpen] = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(true);
  const wrapperRef = useRef(null);

  const authState = useSelector((state) => state.eportalAuthCounts.data);
  const activities = useMemo(() => normalizeActivities(authState), [authState]);

  const toggleBell = useCallback(() => setBellOpen((prev) => !prev), []);
  const toggleActivities = useCallback(() => setActivitiesOpen((prev) => !prev), []);

  useEffect(() => {
    if (!bellOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setBellOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [bellOpen]);

  return (
    <li className="nav-item main-drop profile-nav" ref={wrapperRef} style={{ position: "relative" }}>
      <button type="button" className="nav-link btn btn-link p-0" onClick={toggleBell}>
        <i className="ti ti-bell"></i>
      </button>

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
                activities.map((item) => <ActivityItem key={item.href} item={item} />)
              )}
            </ul>
          )}
        </div>
      )}
    </li>
  );
};

export default AuthorizationDropdown;
