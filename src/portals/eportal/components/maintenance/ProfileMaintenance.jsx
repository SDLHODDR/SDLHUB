import { useEffect, useState, useMemo, useRef } from "react";
import ResetButton from "../../../../shared/components/buttons/ResetButton";
import { useLocation } from "react-router-dom";
import { Dropdown } from "primereact/dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "../../assets/css/profileMaintenance.css";

import SDLDataTable from "../../../../shared/components/datatable/SDLDataTable";
import SDLSearch from "../../../../shared/components/datatable/SDLSearch";
import "../../assets/css/wideContentPages.css";
import EportalPageLoader from "../loader/EportalPageLoader";

import {
  addProfile,
  getProfiles,
  getProfileAccess,
  saveMenu,
  saveTask,
  saveDash,
  getProfileUsers,
} from "../../services/profileMaintenanceService";

import {
  notifySuccess,
  notifyError,
  notifyWarning,
  confirmAction,
} from "../../../../shared/services/alertService";

import BreadcrumbNav from "../../../../shared/components/BreadcrumbNav";

import { PROFILE_MAINTENANCE_MESSAGES } from "../../constants/profileMaintenanceConstants";

import { getPortalFromPath } from "../../../../shared/config/portalConfig";
import SDLTabsComponent from "../../../hrms/components/tabs/SDLTabsComponent";

const PROFILE_TABS = [
  { key: "menu", label: "Menu Access" },
  { key: "task", label: "Task Access" },
  { key: "dash", label: "Dashboard Access" },
  { key: "profileUsers", label: "Profile Users" },
];
import { apiError, handleError } from "../../../../shared/services/errorHandler";

const ProfileMaintenance = () => {
  const hasFetchedProfiles = useRef(false);

  const [profiles, setProfiles] = useState([]);
  const [profileId, setProfileId] = useState(null);
  const [activeTab, setActiveTab] = useState("menu");

  /*-----------Add Profile----------*/
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [newProfile, setNewProfile] = useState({
    profileName: "",
    description: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  /*---------------- Menu ----------------*/
  const [menus, setMenus] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [dashboards, setDashboards] = useState([]);

  const [menuAccess, setMenuAccess] = useState({});
  const [submenuAccess, setSubmenuAccess] = useState({});
  const [taskAccess, setTaskAccess] = useState([]);
  const [dashAccess, setDashAccess] = useState([]);
  const [loading, setLoading] = useState(0); // number of tab loads in progress

  const [expandedMenus, setExpandedMenus] = useState({});
  const [menuSearch, setMenuSearch] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [dashSearch, setDashSearch] = useState("");

  const [profileUsers, setProfileUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);

  // Get current portal dynamically
  const location = useLocation();
  const portal = getPortalFromPath(location.pathname);
  const portalHome = `/${portal.key}/dashboard`;

  const allExpanded =
    menus.length > 0 && menus.every((menu) => expandedMenus[menu.ID]);

  /* ---------------- Dash Menu ---------------- */

  const selectAllDash = () => {
    const all = dashboards.map((d) => d.ID);
    setDashAccess(all);
  };

  const clearAllDash = () => {
    setDashAccess([]);
  };
  const filteredDash = dashboards.filter((d) =>
    d.DASH_DESC.toLowerCase().includes(dashSearch.toLowerCase()),
  );

  /* ---------------- Task Menu ---------------- */

  const selectAllTasks = () => {
    const all = tasks.map((t) => t.ID);
    setTaskAccess(all);
  };

  const clearAllTasks = () => {
    setTaskAccess([]);
  };

  const filteredTasks = tasks.filter((task) =>
    task.TASK_DESC.toLowerCase().includes(taskSearch.toLowerCase()),
  );

  /* ---------------- Expand / Collapse Menu ---------------- */

  const toggleExpand = (menuId) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  /* ---------------- Expand All Menus ---------------- */

  const expandAllMenus = () => {
    const expanded = {};
    menus.forEach((menu) => {
      expanded[menu.ID] = true;
    });
    setExpandedMenus(expanded);
  };

  /* ---------------- Collapse All Menus ---------------- */

  const collapseAllMenus = () => {
    const collapsed = {};
    menus.forEach((menu) => {
      collapsed[menu.ID] = false;
    });
    setExpandedMenus(collapsed);
  };

  /* ---------------- select all menus ---------------- */
  const selectAllMenus = () => {
    const newMenuAccess = {};
    const newSubmenuAccess = {};

    menus.forEach((menu) => {
      newMenuAccess[menu.ID] = true;

      menu.submenus.forEach((sub) => {
        newSubmenuAccess[sub.ID] = true;
      });
    });

    setMenuAccess(newMenuAccess);
    setSubmenuAccess(newSubmenuAccess);
  };

  /* ---------------- Clear ALL ---------------- */
  const clearAllMenus = () => {
    setMenuAccess({});
    setSubmenuAccess({});
  };

  /* ---------------- Filter Menu by serach ---------------- */
  const filteredMenus = menus
    .map((menu) => {
      const menuMatch = menu.LABEL.toLowerCase().includes(
        menuSearch.toLowerCase(),
      );

      const filteredSubmenus = menu.submenus.filter((sub) =>
        sub.LABEL.toLowerCase().includes(menuSearch.toLowerCase()),
      );

      if (menuMatch || filteredSubmenus.length > 0) {
        return {
          ...menu,
          submenus: filteredSubmenus.length ? filteredSubmenus : menu.submenus,
        };
      }
      return null;
    })
    .filter(Boolean);

  /* ---------------- LOAD PROFILES ---------------- */

  /* ---------------- LOAD PROFILE ACCESS ---------------- */

  /*
   * Lazy tab loading: a tab's data is fetched the first time the tab is
   * opened for the selected profile and kept after that, so going back to
   * a tab does not call the server again. Changing the profile clears it.
   */
  const loadedTabsRef = useRef(new Set()); // tabs already fetched for the current profile
  const loadingTabsRef = useRef(new Set()); // tabs being fetched right now
  const currentProfileRef = useRef(null); // ignores replies for a profile no longer selected

  const loadProfileAccess = async (id, section) => {
    try {
      setLoading((count) => count + 1);

      const res = await getProfileAccess(id, section);

      if (currentProfileRef.current !== id) return false;

      if (!res?.status) {
        handleError(apiError(res, "Unable to load profile access."), { context: "Load profile access" });
        return false;
      }

      const access = res.data || {};

      if (section === "menu") {
        setMenus(access.menus || []);
        setMenuAccess(access.menuAccess || {});
        setSubmenuAccess(access.submenuAccess || {});
      } else if (section === "task") {
        setTasks(access.tasks || []);
        setTaskAccess((access.taskAccess || []).map(Number));
      } else if (section === "dash") {
        setDashboards(access.dashboards || []);
        setDashAccess((access.dashAccess || []).map(Number));
      }

      return true;
    } catch (error) {
      if (currentProfileRef.current === id) {
        handleError(error, { context: "Load profile access", fallback: "Unable to load profile access." });
      }
      return false;
    } finally {
      setLoading((count) => count - 1);
    }
  };

  useEffect(() => {
    if (hasFetchedProfiles.current) return;

    hasFetchedProfiles.current = true;

    const fetchProfiles = async () => {
      try {
        const response = await getProfiles();

        if (response?.status) {
          setProfiles(
            (response.data || []).map((p) => ({
              value: p.PROFILE_ID,
              label: p.PROFILE_DESC,
            })),
          );
        } else {
          handleError(apiError(response, "Unable to load profiles."), { context: "Load profiles" });
        }
      } catch (err) {
        handleError(err, { context: "Load profiles", fallback: "Unable to load profiles." });
      }
    };

    fetchProfiles();
  }, []);

  const loadProfileUsers = async (id) => {
    try {
      setUserLoading(true);

      const res = await getProfileUsers(id);

      if (currentProfileRef.current !== id) return false;

      setProfileUsers(res?.status ? res.data || [] : []);
      setFirst(0);
      return Boolean(res?.status);
    } catch (error) {
      if (currentProfileRef.current === id) {
        handleError(error, { context: "Load profile users", fallback: "Unable to load profile users." });
        setProfileUsers([]);
      }
      return false;
    } finally {
      setUserLoading(false);
    }
  };

  /* Fetch a tab's data unless it is already loaded (or loading). */
  const loadTab = async (tab, id = currentProfileRef.current, { force = false } = {}) => {
    if (!id) return;
    if (!force && (loadedTabsRef.current.has(tab) || loadingTabsRef.current.has(tab))) return;

    loadingTabsRef.current.add(tab);

    const ok =
      tab === "profileUsers"
        ? await loadProfileUsers(id)
        : await loadProfileAccess(id, tab);

    if (currentProfileRef.current !== id) return; // profile changed meanwhile

    loadingTabsRef.current.delete(tab);

    // A failed load is not kept, so opening the tab again retries it.
    if (ok) loadedTabsRef.current.add(tab);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    loadTab(tab);
  };

  /* ---------------- PROFILE CHANGE ---------------- */

  const handleProfileChange = (value) => {
    if (!value) {
      resetProfileData();
      return;
    }

    clearProfileData();
    currentProfileRef.current = value;
    setProfileId(value);

    // Menu Access is the active tab after a profile change; only it is fetched now.
    setActiveTab("menu");
    loadTab("menu", value);
  };

  /* ---------------- MENU CHECKBOX ---------------- */

  const toggleMenu = (menuId, checked) => {
    setMenuAccess({
      ...menuAccess,
      [menuId]: checked,
    });

    const updated = { ...submenuAccess };

    menus
      .find((m) => m.ID === menuId)
      ?.submenus.forEach((s) => {
        updated[s.ID] = checked;
      });

    setSubmenuAccess(updated);
  };

  /* ---------------- SUBMENU CHECKBOX ---------------- */

  const toggleSubmenu = (submenuId) => {
    setSubmenuAccess({
      ...submenuAccess,
      [submenuId]: !submenuAccess[submenuId],
    });
  };

  /* ---------------- TASK CHECKBOX ---------------- */

  const toggleTask = (taskId) => {
    taskId = Number(taskId);

    setTaskAccess((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  /* ---------------- DASH CHECKBOX ---------------- */

  const toggleDash = (dashId) => {
    dashId = Number(dashId);

    setDashAccess((prev) =>
      prev.includes(dashId)
        ? prev.filter((id) => id !== dashId)
        : [...prev, dashId],
    );
  };

  /* ---------------- SAVE MENU ---------------- */

  const handleSaveMenu = async () => {
    try {
      if (!profileId) {
        notifyWarning(PROFILE_MAINTENANCE_MESSAGES.SELECT_PROFILE);
        return;
      }

      const hasMenuSelected = Object.values(menuAccess).some(
        (value) => value === true,
      );

      const hasSubmenuSelected = Object.values(submenuAccess).some(
        (value) => value === true,
      );

      if (!hasMenuSelected && !hasSubmenuSelected) {
        notifyWarning(PROFILE_MAINTENANCE_MESSAGES.MENU_REQUIRED);
        return;
      }

      const confirmed = await confirmAction(
        PROFILE_MAINTENANCE_MESSAGES.MENU_SAVE_TITLE,
        PROFILE_MAINTENANCE_MESSAGES.MENU_SAVE_CONFIRM,
      );

      if (!confirmed) return;

      const res = await saveMenu({
        profile: profileId,
        menuAccess,
        submenuAccess,
      });

      if (res.status) {
        await notifySuccess(
          res.message || PROFILE_MAINTENANCE_MESSAGES.MENU_SAVED,
        );

        // Reload the menu tab so it shows what was saved.
        await loadTab("menu", profileId, { force: true });
      } else {
        notifyError(
          res.message || PROFILE_MAINTENANCE_MESSAGES.MENU_SAVE_FAILED,
        );
      }
    } catch {
      notifyError(PROFILE_MAINTENANCE_MESSAGES.MENU_SAVE_ERROR);

    }
  };

  /* ---------------- SAVE TASK ---------------- */

  const handleSaveTask = async () => {
    try {
      const confirmed = await confirmAction(
        PROFILE_MAINTENANCE_MESSAGES.TASK_SAVE_TITLE,
        PROFILE_MAINTENANCE_MESSAGES.TASK_SAVE_CONFIRM,
      );

      if (!confirmed) return;

      const resTask = await saveTask({
        profile: profileId,
        tasks: taskAccess,
      });

      if (resTask.status) {
        await notifySuccess(
          resTask.message || PROFILE_MAINTENANCE_MESSAGES.TASK_SAVED,
        );
      } else {
        notifyError(
          resTask.message || PROFILE_MAINTENANCE_MESSAGES.TASK_SAVE_FAILED,
        );
      }
    } catch {
      notifyError(PROFILE_MAINTENANCE_MESSAGES.TASK_SAVE_ERROR);
    }
  };

  /* ---------------- SAVE DASH ---------------- */

  const handleSaveDash = async () => {
    try {
      const confirmed = await confirmAction(
        PROFILE_MAINTENANCE_MESSAGES.DASH_SAVE_TITLE,
        PROFILE_MAINTENANCE_MESSAGES.DASH_SAVE_CONFIRM,
      );

      if (!confirmed) return;

      const resDash = await saveDash({
        profile: profileId,
        dashboards: dashAccess,
      });

      if (resDash.status) {
        await notifySuccess(
          resDash.message || PROFILE_MAINTENANCE_MESSAGES.DASH_SAVED,
        );
      } else {
        notifyError(
          resDash.message || PROFILE_MAINTENANCE_MESSAGES.DASH_SAVE_FAILED,
        );
      }
    } catch {
      notifyError(PROFILE_MAINTENANCE_MESSAGES.DASH_SAVE_ERROR);
    }
  };

  /* ================= PROFILE USERS TAB ================= */

  const [userSearch, setUserSearch] = useState("");
  const [userRows, setUserRows] = useState(10);
  const [first, setFirst] = useState(0);

  const profileUserColumns = [
    {
      field: "empCode",
      header: "Employee Code",
      sortable: true,
    },
    {
      field: "empName",
      header: "Employee Name",
      sortable: true,
    },
    {
      field: "department",
      header: "Department",
      sortable: true,
    },
    {
      field: "designation",
      header: "Designation",
      sortable: true,
      style: { Alignment: "left" },
    },
  ];

  /* ================= FILTER PROFILE USERS ================= */

  const filteredProfileUsers = useMemo(() => {
    if (!userSearch) return profileUsers;

    return profileUsers.filter(
      (item) =>
        item.empCode?.toLowerCase().includes(userSearch.toLowerCase()) ||
        item.empName?.toLowerCase().includes(userSearch.toLowerCase()) ||
        item.department?.toLowerCase().includes(userSearch.toLowerCase()) ||
        item.designation?.toLowerCase().includes(userSearch.toLowerCase()),
    );
  }, [userSearch, profileUsers]);

  const handleMenuSearch = (value) => {
    setMenuSearch(value);

    if (!value) {
      setExpandedMenus({});
      return;
  }
    const expanded = {};

    menus.forEach((menu) => {
      const menuMatch = menu.LABEL.toLowerCase().includes(value.toLowerCase());

      const submenuMatch = menu.submenus.some((sub) =>
        sub.LABEL.toLowerCase().includes(value.toLowerCase()),
      );

      if (menuMatch || submenuMatch) {
        expanded[menu.ID] = true;
      }
    });

    setExpandedMenus(expanded);
  };

  /* ---------------- Add profile ----------------- */
  const openAddProfile = () => {
    setNewProfile({
      profileName: "",
      description: "",
    });

    setShowAddProfile(true);
  };

  const closeAddProfile = () => {
    setShowAddProfile(false);
  };

  const handleProfileInput = (e) => {
    const { name, value } = e.target;

    setNewProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddProfile = async () => {
    if (!newProfile.profileName.trim()) {
      notifyWarning(PROFILE_MAINTENANCE_MESSAGES.PROFILE_NAME_REQUIRED);
      return;
    }

    try {
      setSavingProfile(true);

      const res = await addProfile({
        profileName: newProfile.profileName.trim(),
        description: newProfile.description.trim(),
      });

      if (res.status) {
        notifySuccess(
          res.message || PROFILE_MAINTENANCE_MESSAGES.PROFILE_ADDED,
        );

        closeAddProfile();

        //reload dropdown
        const response = await getProfiles();

        if (response?.status) {
          setProfiles(
            (response.data || []).map((p) => ({
              value: p.PROFILE_ID,
              label: p.PROFILE_DESC,
            })),
          );
        }
      } else {
        notifyError(
          res.message || PROFILE_MAINTENANCE_MESSAGES.PROFILE_ADD_FAILED,
        );
      }
    } catch {
      notifyError(PROFILE_MAINTENANCE_MESSAGES.PROFILE_ADD_ERROR);
    } finally {
      setSavingProfile(false);
    }
  };

  /* Clears all tab data and forgets which tabs were loaded. */
  const clearProfileData = () => {
    loadedTabsRef.current = new Set();
    loadingTabsRef.current = new Set();
    setFirst(0);

    setMenus([]);
    setTasks([]);
    setDashboards([]);

    setMenuAccess({});
    setSubmenuAccess({});
    setTaskAccess([]);
    setDashAccess([]);

    setProfileUsers([]);

    setMenuSearch("");
    setTaskSearch("");
    setDashSearch("");
    setUserSearch("");
  };

  const resetProfileData = () => {
    currentProfileRef.current = null;
    setProfileId(null);
    clearProfileData();
  };

  return (
    <>
      {(loading || userLoading) && <EportalPageLoader />}
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Profile Maintenance</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            { text: "Home", link: portalHome },
            { text: "Profile Maintenance" },
          ]}
        />
      </div>

      <div className="card eportal-wide-card">
        <div className="card-body profile-maintenance">
          {/* PROFILE SELECT */}

          <div className="row align-items-center g-2 mb-4">
            {/* Left Side */}
            <div className="col-12 col-sm d-flex align-items-center gap-2">
              <div className="profile-selector" style={{ width: "320px", maxWidth: "100%", flex: "0 1 320px" }}>
                <Dropdown name="profileId" inputId="profileId"
                  value={profileId}
                  options={profiles}
                  onChange={(e) => handleProfileChange(e.value)}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Profile"
                  disabled={loading > 0}
                  filter
                  pt={{ filterInput: { name: "profileSearch" } }}
                  showClear
                  className="w-100"
                />
              </div>

              <ResetButton
                onClick={resetProfileData}
                disabled={!profileId}
              />
            </div>

            {/* Right Side */}
            <div className="col-12 col-sm-auto ms-auto text-end">
              <button className="btn btn-primary" onClick={openAddProfile}>
                Add Profile
              </button>
            </div>
          </div>

          {profileId && (
            <>
              {/* TABS */}

              <SDLTabsComponent
                tabs={PROFILE_TABS}
                selectedTab={activeTab}
                onTabChange={handleTabChange}
              >

              {loading ? null : (
                <div className="tab-content">
                  {/* MENU ACCESS */}

                  <div className={`tab-pane ${activeTab === "menu" ? "active" : ""}`} id="menu">
                    {menus.length > 0 && (
                      <>
                        {/* SEARCH */}
                        <div className="row mb-3">
                          <div className="col-12 col-md-auto mb-2 mb-md-0">
                            <SDLSearch
                              value={menuSearch}
                              onChange={handleMenuSearch}
                              placeholder="Search menu..."
                              className="mb-0 profile-search"
                            />
                          </div>

                          <div className="col-12 col-md">
                            <div className="action-btn-group">
                              <button
                                className="btn btn-outline-secondary"
                                onClick={expandAllMenus}
                                disabled={allExpanded}
                              >
                                Expand All
                              </button>

                              <button
                                className="btn btn-outline-warning"
                                onClick={collapseAllMenus}
                              >
                                Collapse All
                              </button>

                              <button
                                className="btn btn-outline-success"
                                onClick={selectAllMenus}
                              >
                                Select All
                              </button>

                              <button
                                className="btn btn-outline-danger"
                                onClick={clearAllMenus}
                              >
                                Clear All
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* MENU TREE */}
                        {filteredMenus.map((menu) => {
                          const hasSubmenus =
                            menu.submenus && menu.submenus.length > 0;

                          const hideCheckboxMenus = ["Dashboard", "Logout"];
                          const showCheckbox = !hideCheckboxMenus.includes(
                            menu.LABEL,
                          );

                          return (
                            <div key={menu.ID} className="border rounded mb-2">
                              {/* MENU HEADER */}

                              <div
                                className="p-2 bg-light d-flex align-items-center menu-header"
                                style={{
                                  cursor: hasSubmenus ? "pointer" : "default",
                                }}
                                onClick={() =>
                                  hasSubmenus && toggleExpand(menu.ID)
                                }
                              >
                                {/* Checkbox only if allowed */}
                                {showCheckbox && (
                                  <div className="form-check">
                                    <input name="menuAccess"
                                      className="form-check-input"
                                      type="checkbox"
                                      checked={menuAccess[menu.ID] || false}
                                      onChange={(e) =>
                                        toggleMenu(menu.ID, e.target.checked)
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                )}

                                {/* Menu Label */}
                                <div className="text-secondary">
                                  <strong>
                                    {hasSubmenus && (
                                      <FontAwesomeIcon
                                        icon={
                                          expandedMenus[menu.ID]
                                            ? faChevronDown
                                            : faChevronRight
                                        }
                                        style={{
                                          marginRight: "6px",
                                          fontSize: "12px",
                                        }}
                                      />
                                    )}
                                    {menu.LABEL}
                                  </strong>
                                </div>
                              </div>

                              {/* SUBMENUS */}
                              {hasSubmenus && expandedMenus[menu.ID] && (
                                <div className="submenu-container menu-submenu-grid">
                                  {menu.submenus.map((sub) => (
                                    <div
                                      key={sub.ID}
                                      className="form-check profile-task-option"
                                    >
                                      <input
                                        id={`submenu-${sub.ID}`}
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={submenuAccess[sub.ID] || false}
                                        onChange={() => toggleSubmenu(sub.ID)}
                                      />

                                      <label
                                        htmlFor={`submenu-${sub.ID}`}
                                        className="form-check-label"
                                        style={{ cursor: "pointer" }}
                                      >
                                        {sub.LABEL}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* SAVE BUTTON */}

                        {profileId && menus.length > 0 && (
                          <div className="text-center mt-4">
                            <button
                              className="btn btn-primary"
                              onClick={handleSaveMenu}
                            >
                              Save Menu Access
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* TASK ACCESS */}

                  <div className={`tab-pane ${activeTab === "task" ? "active" : ""}`} id="task">
                    {tasks.length > 0 && (
                      <>
                        <div className="row mb-3">
                          <div className="col-12 col-md-auto mb-2 mb-md-0">
                            <SDLSearch
                              value={taskSearch}
                              onChange={setTaskSearch}
                              placeholder="Search task..."
                              className="mb-0 profile-search"
                            />
                          </div>

                          <div className="col-12 col-md">
                            <div className="action-btn-group">
                              <button
                                className="btn btn-outline-success"
                                onClick={selectAllTasks}
                              >
                                Select All
                              </button>

                              <button
                                className="btn btn-outline-danger"
                                onClick={clearAllTasks}
                              >
                                Clear All
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="profile-task-grid mb-3">
                          {filteredTasks.map((task) => (
                            <div
                              key={task.ID}
                              className="form-check profile-task-option"
                            >
                              <input
                                id={`task-${task.ID}`}
                                className="form-check-input"
                                type="checkbox"
                                checked={taskAccess.includes(Number(task.ID))}
                                onChange={() => toggleTask(task.ID)}
                              />

                              <label
                                htmlFor={`task-${task.ID}`}
                                className="form-check-label"
                              >
                                {task.TASK_DESC}
                              </label>
                            </div>
                          ))}
                        </div>

                        {profileId && (
                          <div className="text-center mt-4">
                            <button
                              className="btn btn-primary"
                              onClick={handleSaveTask}
                            >
                              Save Task Access
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* DASH ACCESS */}

                  <div className={`tab-pane ${activeTab === "dash" ? "active" : ""}`} id="dash">
                    {dashboards.length > 0 && (
                      <>
                        <div className="row mb-3">
                          <div className="col-12 col-md-auto mb-2 mb-md-0">
                            <SDLSearch
                              value={dashSearch}
                              onChange={setDashSearch}
                              placeholder="Search dashboard..."
                              className="mb-0 profile-search"
                            />
                          </div>

                          <div className="col-12 col-md">
                            <div className="action-btn-group">
                              <button
                                className="btn btn-outline-success"
                                onClick={selectAllDash}
                              >
                                Select All
                              </button>

                              <button
                                className="btn btn-outline-danger"
                                onClick={clearAllDash}
                              >
                                Clear All
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="profile-task-grid mb-3">
                          {filteredDash.map((dash) => (
                            <div
                              key={dash.ID}
                              className="form-check profile-task-option"
                            >
                              <input
                                id={`dash-${dash.ID}`}
                                className="form-check-input"
                                type="checkbox"
                                checked={dashAccess.includes(Number(dash.ID))}
                                onChange={() => toggleDash(dash.ID)}
                              />

                              <label
                                htmlFor={`dash-${dash.ID}`}
                                className="form-check-label"
                              >
                                {dash.DASH_DESC}
                              </label>
                            </div>
                          ))}
                        </div>

                        {profileId && (
                          <div className="text-center mt-4">
                            <button
                              className="btn btn-primary"
                              onClick={handleSaveDash}
                            >
                              Save Dashboard Access
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className={`tab-pane ${activeTab === "profileUsers" ? "active" : ""}`} id="profileUsers">
                    {/* SEARCH BOX */}
                    <div className="row mb-3">
                      <div className="col-12 col-md-auto mb-2 mb-md-0">
                            <SDLSearch
                              value={userSearch}
                              onChange={(value) => {
                                setUserSearch(value);
                                setFirst(0); // back to page 1 for a new search
                              }}
                              placeholder="Search users..."
                              className="mb-0 profile-search"
                            />
                          </div>
                    </div>

                    {/* TABLE */}
                    <div className="profile-users-table">
                      {userLoading ? null : filteredProfileUsers.length === 0 ? (
                        <div className="p-4 text-center text-muted">
                          No users found for selected profile
                        </div>
                      ) : (
                        <SDLDataTable
                          data={filteredProfileUsers}
                          columns={profileUserColumns}
                          loading={false}
                          emptyMessage={userLoading ? " " : "No users found for selected profile"}
                          className="profile-users-grid"
                          rows={userRows}
                          first={first}
                          onPage={(e) => {
                            setFirst(e.first);
                            setUserRows(e.rows);
                          }}
                          paginator={filteredProfileUsers.length > userRows}
                          rowsPerPageOptions={
                            filteredProfileUsers.length > userRows
                              ? [10, 25, 50, 100]
                              : []
                          }
                          tableStyle={{ minWidth: "900px" }}
                          scrollHeight="flex"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
              </SDLTabsComponent>
            </>
          )}
        </div>
      </div>

      {showAddProfile && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Add Profile</h4>
                  <button
                    type="button"
                    className="close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={closeAddProfile}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>

                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Profile Name <span className="text-danger">*</span>
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        name="profileName"
                        value={newProfile.profileName}
                        onChange={handleProfileInput}
                        maxLength={100}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Description</label>

                      <input
                        type="text"
                        className="form-control"
                        name="description"
                        value={newProfile.description}
                        onChange={handleProfileInput}
                        maxLength={200}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">

                  <button
                    className="btn btn-primary me-2"
                    disabled={savingProfile}
                    onClick={handleAddProfile}
                  >
                    {savingProfile ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </button>

                  <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={
                    closeAddProfile
                  }
                >
                  Cancel
                </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </>
  );
};

export default ProfileMaintenance;
