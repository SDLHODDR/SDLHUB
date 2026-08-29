import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Badge from "../../portals/eportal/components/Badge";
import { normalizeHrmsGroups } from "./normalizeHrmsGroups";

const getGroupTotal = (group) =>
  group.items.reduce((sum, item) => sum + (item.count || 0), 0);

const GroupHeader = ({ group, open, onToggle }) => {
  const total = getGroupTotal(group);

  return (
    <button
      type="button"
      className="d-flex align-items-center justify-content-between btn btn-link p-0 text-start text-decoration-none w-100"
      style={{ fontWeight: 500, padding: "6px 0" }}
      onClick={onToggle}
    >
      <span className="d-flex align-items-center">
        {group.label}
        {total > 0 && (
          <Badge text={total} className="shadow-none badge-danger badge-xs ms-2" />
        )}
      </span>
      <i className={`ti ${open ? "ti-chevron-up" : "ti-chevron-down"} fs-14`}></i>
    </button>
  );
};

const GroupItem = ({ item, onNavigate }) => (
  <li>
    <Link
      to={item.href}
      className="d-flex align-items-center justify-content-between p-2 rounded"
      style={{ paddingLeft: "12px" }}
      onClick={onNavigate}
    >
      <span className="text-gray">{item.label}</span>
      <Badge text={item.count} className="shadow-none badge-danger badge-xs" />
    </Link>
  </li>
);

const AuthorizationHRMSDropdown = () => {
  const [bellOpen, setBellOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({ recruitment: true });

  const wrapperRef = useRef(null);

  const successCnt = useSelector((state) => state.hrmsAuthCounts.success);
  const hrmsAuthData = useSelector((state) => state.hrmsAuthCounts.data);

  const groups = useMemo(() => normalizeHrmsGroups(hrmsAuthData), [hrmsAuthData]);

  const displayCount = useMemo(
    () => groups.reduce((sum, g) => sum + getGroupTotal(g), 0),
    [groups],
  );

  const toggleBell = useCallback(() => setBellOpen((prev) => !prev), []);
  const toggleGroup = useCallback((key) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);
  const handleItemNavigate = useCallback(() => setBellOpen(false), []);

  useEffect(() => {
    if (!bellOpen) return undefined;

    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setBellOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [bellOpen]);

  return (
    <div
      ref={wrapperRef}
      className="authorization-dropdown"
      style={{ position: "relative", marginRight: "14px" }}
    >
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
            {displayCount}
          </span>
        )}
      </a>

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
            minWidth: "300px",
            maxHeight: "420px",
            overflowY: "auto",
            padding: "16px",
          }}
        >
          <div className="d-flex flex-column">
            {groups.length === 0 ? (
              <div className="p-2 text-gray">No pending approvals</div>
            ) : (
              groups.map((group) => {
                const isOpen = !!openGroups[group.key];

                return (
                  <div
                    key={group.key}
                    style={{
                      borderBottom: "1px solid #f0f0f0",
                      paddingBottom: "6px",
                      marginBottom: "6px",
                    }}
                  >
                    <GroupHeader
                      group={group}
                      open={isOpen}
                      onToggle={() => toggleGroup(group.key)}
                    />

                    {isOpen && (
                      <ul className="list-unstyled mb-0">
                        {group.items.length === 0 ? (
                          <li className="p-2 text-gray" style={{ paddingLeft: "12px" }}>
                            No pending items
                          </li>
                        ) : (
                          group.items.map((item) => (
                            <GroupItem
                              key={item.href}
                              item={item}
                              onNavigate={handleItemNavigate}
                            />
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorizationHRMSDropdown;