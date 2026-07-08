import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";

// Static per-task visual config, keyed by TASK_ID from the API.
// Add an entry here whenever a new TASK_ID shows up in the response.
const TASK_CONFIG = {
  109: { icon: "ti-inbox", href: "#", badgeClass: "badge-danger", active: true },
  346: { icon: "ti-star", href: "#", badgeClass: "", active: false },
  349: { icon: "ti-rocket", href: "#", badgeClass: "", active: false },
  357: { icon: "ti-file", href: "#", badgeClass: "", active: false },
};

const DEFAULT_TASK_CONFIG = {
  icon: "ti-bell",
  href: "#",
  badgeClass: "",
  active: false,
};

const AuthorizationDropdown = () => {
  const [bellOpen, setBellOpen] = useState(false);
  const [activitiesOpen, setActivitiesOpen] = useState(true);
  const wrapperRef = useRef(null);

  const authState = useSelector((state) => state.eportalAuthCounts.data);

  console.log("======authState=======", authState);

  // authState shape: { data: [ {TASK_ID, TASK_DESC, TOTAL}, ... ], status, success }
  const tasks = authState || [];

  const activities = tasks.map((task) => {
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

  // Close on outside click - only listens while open
  useEffect(() => {
    if (!bellOpen) return;

    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [bellOpen]);

  return (
    <li
      className="nav-item main-drop profile-nav"
      ref={wrapperRef}
      style={{ position: "relative" }}
    >
      <a
        href="javascript:void(0);"
        className="nav-link"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setBellOpen((prev) => !prev);
        }}
      >
        <i className="ti ti-bell"></i>
      </a>

      {/* Custom panel - NOT using .dropdown-menu classes to avoid
          conflicting !important rules from the template's Bootstrap/Popper CSS */}
      {bellOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            left: "auto",
            zIndex: 1050,
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
            minWidth: "260px",
            padding: "16px",
          }}
        >
          <a
            href="javascript:void(0);"
            className="d-flex align-items-center justify-content-between"
            style={{ fontWeight: 600, marginBottom: activitiesOpen ? "12px" : 0 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActivitiesOpen((prev) => !prev);
            }}
          >
            <span>Activities</span>
            <i
              className={
                "ti " + (activitiesOpen ? "ti-chevron-up" : "ti-chevron-down")
              }
            ></i>
          </a>

          {activitiesOpen && (
            <ul className="list-unstyled mb-0">
              {activities.length === 0 && (
                <li className="p-2 text-gray">No activities</li>
              )}
              {activities.map((item, idx) => (
                <li key={idx}>
                  <a
                    href={item.href}
                    className={
                      "d-flex align-items-center justify-content-between p-2 rounded " +
                      (item.active ? "active" : "")
                    }
                  >
                    <span className="d-flex align-items-center fw-medium">
                      <i className={"ti " + item.icon + " text-gray me-2"}></i>
                      {item.label}
                    </span>
                    <span
                      className={
                        "badge shadow-none rounded-pill " +
                        (item.badgeClass
                          ? item.badgeClass + " badge-xs"
                          : "text-gray")
                      }
                    >
                      {item.count}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
};

export default AuthorizationDropdown;