import { useEffect, useState, useMemo } from "react";
import { Dropdown } from "primereact/dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import "../../assets/css/profileMaintenance.css";

import SDLDataTable from "../../../../components/datatable/SDLDataTable";

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
} from "../../../../services/alertService";

import BreadcrumbNav from "../breadcrumb-nav/BreadcrumbNav";

import { PROFILE_MAINTENANCE_MESSAGES } from "../../constants/profileMaintenanceConstants";

const ProfileMaintenance = () => {
  const [profiles, setProfiles] = useState([]);

  const [profileId, setProfileId] = useState(null);

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
  const [loading, setLoading] = useState(false);

  const [expandedMenus, setExpandedMenus] = useState({});
  const [menuSearch, setMenuSearch] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [dashSearch, setDashSearch] = useState("");

  const [profileUsers, setProfileUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);

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

  /* const loadProfiles = async () => {

        try {
            const data = await getProfiles();
           
            const options = data.map((p) => ({
                value: p.PROFILE_ID,
                label: p.PROFILE_DESC
            }));

            setProfiles(options);

        } catch (err) {
            console.error(err);
        }
    };*/
  /* ---------------- LOAD PROFILE ACCESS ---------------- */

  const loadProfileAccess = async (profileId) => {
    try {
      setLoading(true);

      const data = await getProfileAccess(profileId);

      setMenus(data.menus || []);
      setTasks(data.tasks || []);
      setDashboards(data.dashboards || []);

      setMenuAccess(data.menuAccess || {});
      setSubmenuAccess(data.submenuAccess || {});
      setTaskAccess(data.taskAccess || []);
      setDashAccess(data.dashAccess || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data = await getProfiles();

        setProfiles(
          data.map((p) => ({
            value: p.PROFILE_ID,
            label: p.PROFILE_DESC,
          })),
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfiles();
  }, []);

  const loadProfileUsers = async (profileId) => {
    try {
      setUserLoading(true);

      const res = await getProfileUsers(profileId);

      if (res?.status) {
        setProfileUsers(res.data || []);
      } else {
        setProfileUsers([]);
      }
    } catch (error) {
      console.error("Profile Users Fetch Error:", error);
      setProfileUsers([]);
    } finally {
      setUserLoading(false);
    }
  };

  /* ---------------- PROFILE CHANGE ---------------- */

  const handleProfileChange = async (value) => {
    setProfileId(value);
    setFirst(0);

    // load all data
    await loadProfileAccess(value);
    await loadProfileUsers(value);

    // force Menu Access tab as active after profile change
    setTimeout(() => {
      const menuTab = document.querySelector(
        'a[data-bs-toggle="tab"][href="#menu"]',
      );

      if (menuTab) {
        menuTab.click();
      }
    }, 100);
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
    if (taskAccess.includes(taskId)) {
      setTaskAccess(taskAccess.filter((t) => t !== taskId));
    } else {
      setTaskAccess([...taskAccess, taskId]);
    }
  };

  /* ---------------- DASH CHECKBOX ---------------- */

  const toggleDash = (dashId) => {
    if (dashAccess.includes(dashId)) {
      setDashAccess(dashAccess.filter((d) => d !== dashId));
    } else {
      setDashAccess([...dashAccess, dashId]);
    }
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

        // reload page so latest menu access reflects in sidebar/menu
        //window.location.reload();
        await loadProfileAccess();

        setProfileId(profileId);

        await loadProfileAccess(profileId);
        await loadProfileUsers(profileId);
      } else {
        notifyError(
          res.message || PROFILE_MAINTENANCE_MESSAGES.MENU_SAVE_FAILED,
        );
      }
    } catch {
      notifyError(PROFILE_MAINTENANCE_MESSAGES.MENU_SAVE_ERROR);

      /*    
      notifyError(
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while saving menu access"
      );*/
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

  //const selectedProfileName = profiles.find(p => p.value === profileId)?.label || "";

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

  useEffect(() => {
    setFirst(0);
  }, [userSearch, profileUsers]);

  const handleMenuSearch = (value) => {
    setMenuSearch(value);

    if (!value) return;

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
        const data = await getProfiles();

        setProfiles(
          data.map((p) => ({
            value: p.PROFILE_ID,
            label: p.PROFILE_DESC,
          })),
        );
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
  }

const resetProfileData = () => {
    setProfileId(null);
};

  return (
    <>
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Profile Maintenance</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            { text: "Home", link: "/eportal/dashboard" },
            { text: "Profile Maintenance" },
          ]}
        />
      </div>

      <div className="card">
        <div className="card-body profile-maintenance">
          {/* PROFILE SELECT */}

          <div className="row align-items-center mb-4">
            {/* Left Side */}
            <div className="col d-flex align-items-center gap-2">
              <div className="profile-selector" style={{ width: "320px" }}>
                <Dropdown
                  value={profileId}
                  options={profiles}
                  onChange={(e) => handleProfileChange(e.value)}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Profile"
                  disabled={loading}
                  filter
                  showClear
                  className="w-100"
                />
              </div>

              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={!profileId}
                 onClick={resetProfileData}
              >
                <i className="ti ti-refresh me-1"></i>
                Reset
              </button>
            </div>

            {/* Right Side */}
            <div className="col-auto ms-auto">
              <button className="btn btn-primary" onClick={openAddProfile}>
                <i className="ti ti-plus me-1"></i>
                Add Profile
              </button>
            </div>
          </div>

          {/*
            {profileId && (
            <div className="card mb-3 border-primary">
            <div className="card-body py-2">
            <h5 className="mb-0 text-primary">
            Profile Access : {selectedProfileName}
            </h5>
            </div>
            </div>
        )} */}
          {profileId && (
            <>
              {/* TABS */}

              <ul className="nav nav-tabs nav-tabs-bottom mb-3 profile-tabs">
                <li className="nav-item">
                  <a
                    className="nav-link active"
                    data-bs-toggle="tab"
                    href="#menu"
                  >
                    Menu Access
                  </a>
                </li>

                <li className="nav-item">
                  <a className="nav-link" data-bs-toggle="tab" href="#task">
                    Task Access
                  </a>
                </li>

                <li className="nav-item">
                  <a className="nav-link" data-bs-toggle="tab" href="#dash">
                    Dashboard Access
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    data-bs-toggle="tab"
                    href="#profileUsers"
                  >
                    Profile Users
                  </a>
                </li>
              </ul>

              {loading ? (
                <div className="text-center p-5">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                  ></div>
                  <div className="mt-2">Loading profile access...</div>
                </div>
              ) : (
                <div className="tab-content">
                  {/* MENU ACCESS */}

                  <div className="tab-pane active" id="menu">
                    {menus.length > 0 && (
                      <>
                        {/* SEARCH */}
                        <div className="row mb-3">
                          <div className="col-12 col-md-4 mb-2 mb-md-0">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Search menu..."
                              value={menuSearch}
                              onChange={(e) => handleMenuSearch(e.target.value)}
                            />
                          </div>

                          <div className="col-md-8">
                            <div className="action-btn-group">
                              <button
                                className="btn btn-outline-darkBlue btn-sm me-2"
                                onClick={expandAllMenus}
                                disabled={allExpanded}
                              >
                                Expand All
                              </button>

                              <button
                                className="btn btn-outline-warning btn-sm me-2"
                                onClick={collapseAllMenus}
                              >
                                Collapse All
                              </button>

                              <button
                                className="btn btn-outline-success btn-sm me-2"
                                onClick={selectAllMenus}
                              >
                                Select All
                              </button>

                              <button
                                className="btn btn-outline-danger btn-sm"
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
                              {/*<div
                                  className="p-2 bg-light d-flex justify-content-between align-items-center"
                                  style={{ cursor: hasSubmenus ? "pointer" : "default" }}
                                  onClick={() => hasSubmenus && toggleExpand(menu.ID)} >
                                  <div>
                                  <strong>
                                  {hasSubmenus && (expandedMenus[menu.ID] ? "▼" : "▶")}{" "}
                                  {menu.LABEL}
                                  </strong>
                                  </div>

                                  <div>
                                  <input
                                  type="checkbox"
                                  checked={menuAccess[menu.ID] || false}
                                  onChange={(e) =>
                                  toggleMenu(menu.ID, e.target.checked)
                                  }
                                  />
                                  </div>
                              </div> */}

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
                                    <input
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
                                <div className="submenu-container">
                                  {menu.submenus.map((sub) => (
                                    <div
                                      key={sub.ID}
                                      className="form-check me-3"
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

                  <div className="tab-pane" id="task">
                    {tasks.length > 0 && (
                      <>
                        <div className="row mb-3">
                          <div className="col-12 col-md-4 mb-2 mb-md-0">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Search task..."
                              value={taskSearch}
                              onChange={(e) => setTaskSearch(e.target.value)}
                            />
                          </div>

                          <div className="col-md-8">
                            <div className="action-btn-group">
                              <button
                                className="btn btn-outline-success btn-sm me-2"
                                onClick={selectAllTasks}
                              >
                                Select All
                              </button>

                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={clearAllTasks}
                              >
                                Clear All
                              </button>
                            </div>
                          </div>
                        </div>

                        {filteredTasks.map((task) => (
                          <div
                            key={task.ID}
                            className="form-check form-check-inline"
                          >
                            <input
                              id={`task-${task.ID}`}
                              className="form-check-input"
                              type="checkbox"
                              checked={taskAccess.includes(task.ID)}
                              onChange={() => toggleTask(task.ID)}
                            />

                            <label
                              htmlFor={`task-${task.ID}`}
                              className="form-check-label ms-2"
                              style={{ cursor: "pointer" }}
                            >
                              {task.TASK_DESC}
                            </label>
                          </div>
                        ))}

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

                  <div className="tab-pane" id="dash">
                    {dashboards.length > 0 && (
                      <>
                        <div className="row mb-3">
                          <div className="col-12 col-md-4 mb-2 mb-md-0">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Search dashboard..."
                              value={dashSearch}
                              onChange={(e) => setDashSearch(e.target.value)}
                            />
                          </div>

                          <div className="col-md-8 action-btn-group">
                            <button
                              className="btn btn-outline-success btn-sm me-2"
                              onClick={selectAllDash}
                            >
                              Select All
                            </button>

                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={clearAllDash}
                            >
                              Clear All
                            </button>
                          </div>
                        </div>

                        {filteredDash.map((dash) => (
                          <div
                            key={dash.ID}
                            className="form-check form-check-inline"
                          >
                            <input
                              id={`dash-${dash.ID}`}
                              className="form-check-input"
                              type="checkbox"
                              checked={dashAccess.includes(dash.ID)}
                              onChange={() => toggleDash(dash.ID)}
                            />

                            <label
                              htmlFor={`dash-${dash.ID}`}
                              className="form-check-label ms-2"
                              style={{ cursor: "pointer" }}
                            >
                              {dash.DASH_DESC}
                            </label>
                          </div>
                        ))}

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

                  <div className="tab-pane" id="profileUsers">
                    {/* SEARCH BOX */}
                    <div className="row mb-3">
                      <div className="col-12 col-md-4 mb-2 mb-md-0">
                        <div className="search-set">
                          <div className="search-input position-relative">
                            <span className="btn-searchset">
                              <i className="ti ti-search fs-14"></i>
                            </span>

                            <input
                              type="text"
                              className="form-control form-control-sm search-control"
                              placeholder="Search users..."
                              value={userSearch}
                              onChange={(e) => setUserSearch(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TABLE */}
                    <div className="profile-users-table">
                      {userLoading ? (
                        <div className="p-4 text-center">
                          <div className="spinner-border text-warning"></div>
                        </div>
                      ) : filteredProfileUsers.length === 0 ? (
                        <div className="p-4 text-center text-muted">
                          No users found for selected profile
                        </div>
                      ) : (
                        <SDLDataTable
                          data={filteredProfileUsers}
                          columns={profileUserColumns}
                          loading={userLoading}
                          emptyMessage="No users found for selected profile"
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
                          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                          currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                          tableStyle={{ minWidth: "900px" }}
                          scrollHeight="flex"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
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
                  <button className="btn btn-light" onClick={closeAddProfile}>
                    Cancel
                  </button>

                  <button
                    className="btn btn-primary"
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
