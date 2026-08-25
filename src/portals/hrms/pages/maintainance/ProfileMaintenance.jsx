import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Dropdown } from "primereact/dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import {
  getProfiles,
  getProfileAccess,
  saveProfileAccess,
} from "../../services/profileMaintenanceService";

import BreadcrumbNav from "../../../eportal/components/breadcrumb-nav/BreadcrumbNav";

import {
  notifySuccess,
  notifyError,
  notifyWarning,
  confirmAction,
} from "../../../../services/alertService";

import { getPortalFromPath } from "../../../../config/portalConfig";
import "../../assets/css/profileMaintenance.css";

const ProfileMaintenance = () => {
  /* ==========================================================
      PORTAL
  ========================================================== */
  const location = useLocation();
  const portal = getPortalFromPath(location.pathname);
  const portalHome = `/${portal.key}/dashboard`;

  /* ==========================================================
      STATE
  ========================================================== */

  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const [activeTab, setActiveTab] = useState("menu");

  const getInitialAccessData = () => ({
    menu: {
      menus: [],
      subMenus: [],
      selectedMenus: [],
      selectedSubMenus: [],
    },

    company: {
      items: [],
      selected: [],
    },

    division: {
      items: [],
      selected: [],
    },

    department: {
      items: [],
      selected: [],
    },

    task: {
      items: [],
      selected: [],
    },

    dashboard: {
      items: [],
      selected: [],
    },
  });

  const [accessData, setAccessData] = useState(getInitialAccessData());
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ==========================================================
      MENU EXPANSION
  ========================================================== */

  const [expandedMenus, setExpandedMenus] = useState({});

  /* ==========================================================
      SEARCH
  ========================================================== */

  const [menuSearch, setMenuSearch] = useState("");

  /* ==========================================================
      HELPER
  ========================================================== */

  const getId = (item) => {
    return item?.id ?? item?.ID ?? item?.value;
  };

  const getLabel = (item, labelKey = null) => {
    if (!item) {
      return "";
    }

    return (
      (labelKey && item[labelKey]) ??
      item.label ??
      item.LABEL ??
      item.description ??
      item.DESCRIPTION ??
      item.name ??
      ""
    );
  };

  /* ==========================================================
      NORMALIZE PROFILE ACCESS RESPONSE
  ========================================================== */

  const normalizeProfileAccess = (data = {}) => {
    /* ========================================================
      MENU ACCESS
    ======================================================== */

    const menuAccess = Array.isArray(data.menuAccess) ? data.menuAccess : [];

    const menus = menuAccess.map((menu) => ({
      ...menu,
      id: getId(menu),
    }));

    /*
     * Flatten submenu data.
     *
     * We add menuId so that we know which parent menu
     * each submenu belongs to.
     */

    const subMenus = menuAccess.flatMap((menu) => {
      const menuId = getId(menu);

      return (menu.subMenus || []).map((subMenu, index) => ({
        ...subMenu,

        id: getId(subMenu),

        menuId,
        menu_id: menuId,
        MENU_ID: menuId,

        /*
         * Composite UI key.
         *
         * Important because API currently contains duplicate
         * submenu IDs such as:
         *
         * Joining:
         *   New Joinee = 601
         *   Rehire Employee = 601
         *
         * Reports:
         *   Open Positions = 90
         *   Requisition Tracker = 90
         */
        //accessKey: `${String(menuId)}-${String(getId(subMenu))}`,
        accessKey: `${menuId}-${getId(subMenu)}-${index}`,
      }));
    });

    /*
     * Parent menu selection
     */

    const selectedMenus = menus
      .filter((menu) => {
        const menuId = String(getId(menu));

        const children = subMenus.filter(
          (sub) => String(sub.menuId) === menuId,
        );

        // If menu has no submenus, use API value
        if (children.length === 0) {
          return menu.checked === true;
        }

        // Parent is selected only if ALL children are selected
        return children.every((sub) => sub.checked === true);
      })
      .map((menu) => String(getId(menu)));

    const selectedSubMenus = subMenus
      .filter((sub) => sub.checked)
      .map((sub) => sub.accessKey);

    /* ========================================================
        EXPANDED MENUS
    ======================================================== */

    const expanded = {};

    menus.forEach((menu) => {
      const menuId = getId(menu);

      const hasSelectedSubMenu = subMenus.some(
        (subMenu) =>
          String(subMenu.menuId) === String(menuId) && subMenu.checked === true,
      );

      if (hasSelectedSubMenu) {
        expanded[String(menuId)] = true;
      }
    });

    /* ========================================================
        GENERIC ACCESS
    ======================================================== */

    const companyAccess = Array.isArray(data.companyAccess)
      ? data.companyAccess
      : [];

    const divisionAccess = Array.isArray(data.divisionAccess)
      ? data.divisionAccess
      : [];

    const departmentAccess = Array.isArray(data.departmentAccess)
      ? data.departmentAccess
      : [];

    const taskAccess = Array.isArray(data.taskAccess) ? data.taskAccess : [];

    const dashboardAccess = Array.isArray(data.dashboardAccess)
      ? data.dashboardAccess
      : [];

    return {
      accessData: {
        menu: {
          menus,
          subMenus,
          selectedMenus,
          selectedSubMenus,
        },

        company: {
          items: companyAccess,
          selected: companyAccess
            .filter((item) => item.checked === true)
            .map((item) => String(getId(item))),
        },

        division: {
          items: divisionAccess,
          selected: divisionAccess
            .filter((item) => item.checked === true)
            .map((item) => String(getId(item))),
        },

        department: {
          items: departmentAccess,
          selected: departmentAccess
            .filter((item) => item.checked === true)
            .map((item) => String(getId(item))),
        },

        task: {
          items: taskAccess,
          selected: taskAccess
            .filter((item) => item.checked === true)
            .map((item) => String(getId(item))),
        },

        dashboard: {
          items: dashboardAccess,
          selected: dashboardAccess
            .filter((item) => item.checked === true)
            .map((item) => String(getId(item))),
        },
      },

      expanded,
    };
  };

  /* ==========================================================
      LOAD PROFILES
  ========================================================== */

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setLoadingProfiles(true);

        const res = await getProfiles();

        if (res?.status) {
          const profileList = Array.isArray(res.data) ? res.data : [];

          setProfiles(profileList);

          /*
           * Automatically select first profile.
           */

          if (profileList.length > 0) {
            const firstProfile = profileList[0];

            const firstProfileId =
              firstProfile.id ??
              firstProfile.profileId ??
              firstProfile.PROFILE_ID;

            setSelectedProfile(firstProfileId);
          } else {
            setSelectedProfile(null);
          }
        } else {
          notifyError(res?.message || "Unable to load profiles.");
        }
      } catch (error) {
        console.error("Load profiles error:", error);

        notifyError(error?.message || "Unable to load profiles.");
      } finally {
        setLoadingProfiles(false);
      }
    };

    loadProfiles();
  }, []);

  /* ==========================================================
      LOAD PROFILE ACCESS
  ========================================================== */

  useEffect(() => {
    if (
      selectedProfile === null ||
      selectedProfile === undefined ||
      selectedProfile === ""
    ) {
      return;
    }

    const loadProfileAccess = async () => {
      try {
        setLoadingAccess(true);

        const res = await getProfileAccess(selectedProfile);

        if (res?.status) {
          const data = res.data || {};

          const normalized = normalizeProfileAccess(data);

          setAccessData(normalized.accessData);

          setExpandedMenus(normalized.expanded);
        } else {
          notifyError(res?.message || "Unable to load profile access.");
        }
      } catch (error) {
        console.error("Load profile access error:", error);

        notifyError(error?.message || "Unable to load profile access.");
      } finally {
        setLoadingAccess(false);
      }
    };

    loadProfileAccess();
  }, [selectedProfile]);

  /* ==========================================================
      PROFILE DROPDOWN OPTIONS
  ========================================================== */

  const profileOptions = useMemo(() => {
    return profiles.map((profile) => ({
      label:
        profile.description ??
        profile.profileDesc ??
        profile.PROFILE_DESC ??
        profile.label ??
        "",

      value: profile.id ?? profile.profileId ?? profile.PROFILE_ID,
    }));
  }, [profiles]);

  /* ==========================================================
      MENU SEARCH
  ========================================================== */

  const filteredMenus = useMemo(() => {
    const menus = accessData.menu.menus || [];

    const search = menuSearch.trim().toLowerCase();

    if (!search) {
      return menus;
    }

    return menus.filter((menu) => {
      const menuLabel = getLabel(menu).toLowerCase();

      const menuId = getId(menu);

      const subMenus = (accessData.menu.subMenus || []).filter(
        (sub) => String(sub.menuId) === String(menuId),
      );

      const hasMatchingSubMenu = subMenus.some((sub) =>
        getLabel(sub).toLowerCase().includes(search),
      );

      return menuLabel.includes(search) || hasMatchingSubMenu;
    });
  }, [accessData.menu.menus, accessData.menu.subMenus, menuSearch]);

  /* ==========================================================
      GET SUBMENUS
  ========================================================== */

  const getSubMenus = (menuId) => {
    return (accessData.menu.subMenus || []).filter(
      (sub) => String(sub.menuId) === String(menuId),
    );
  };

  /* ==========================================================
      MENU EXPAND / COLLAPSE
  ========================================================== */

  const toggleMenu = (menuId) => {
    const key = String(menuId);

    setExpandedMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  /* ==========================================================
      CHECK MENU
  ========================================================== */

  const handleMenuChange = (menuId, checked) => {
    const subMenus = getSubMenus(menuId);

    const subMenuKeys = subMenus.map((sub) => sub.accessKey);

    setAccessData((prev) => {
      let selectedMenus = [...prev.menu.selectedMenus];
      let selectedSubMenus = [...prev.menu.selectedSubMenus];

      if (checked) {
        if (!selectedMenus.includes(String(menuId))) {
          selectedMenus.push(String(menuId));
        }

        subMenuKeys.forEach((key) => {
          if (!selectedSubMenus.includes(key)) {
            selectedSubMenus.push(key);
          }
        });
      } else {
        selectedMenus = selectedMenus.filter((id) => id !== String(menuId));

        selectedSubMenus = selectedSubMenus.filter(
          (key) => !subMenuKeys.includes(key),
        );
      }

      return {
        ...prev,
        menu: {
          ...prev.menu,
          selectedMenus,
          selectedSubMenus,
        },
      };
    });
  };

  /* ==========================================================
      CHECK SUBMENU
  ========================================================== */

  const handleSubMenuChange = (menuId, subMenu, checked) => {
    setAccessData((prev) => {
      let selectedSubMenus = [...prev.menu.selectedSubMenus];
      let selectedMenus = [...prev.menu.selectedMenus];

      const accessKey = subMenu.accessKey;
      const parentId = String(menuId);

      if (checked) {
        if (!selectedSubMenus.includes(accessKey)) {
          selectedSubMenus.push(accessKey);
        }
      } else {
        selectedSubMenus = selectedSubMenus.filter((key) => key !== accessKey);

        selectedMenus = selectedMenus.filter((id) => id !== parentId);
      }

      const menuSubMenus = prev.menu.subMenus.filter(
        (s) => String(s.menuId) === parentId,
      );

      const allSelected = menuSubMenus.every((s) =>
        selectedSubMenus.includes(s.accessKey),
      );

      if (allSelected) {
        if (!selectedMenus.includes(parentId)) {
          selectedMenus.push(parentId);
        }
      } else {
        selectedMenus = selectedMenus.filter((id) => id !== parentId);
      }

      return {
        ...prev,
        menu: {
          ...prev.menu,
          selectedMenus,
          selectedSubMenus,
        },
      };
    });
  };

  /* ==========================================================
      CHECK IF MENU SELECTED
  ========================================================== */

  const isMenuSelected = (menuId) => {
    return (accessData.menu.selectedMenus || []).some(
      (id) => String(id) === String(menuId),
    );
  };

  /* ==========================================================
      CHECK IF SUBMENU SELECTED
  ========================================================== */

  const isSubMenuSelected = (subMenu) => {
    /*
     * Current API returns submenu IDs only.
     *
     * Therefore selection is checked against
     * the submenu ID.
     */
    return accessData.menu.selectedSubMenus.includes(subMenu.accessKey);
  };

  /* ==========================================================
      SELECT ALL MENUS
  ========================================================== */

  const handleSelectAllMenus = () => {
    const menuIds = (accessData.menu.menus || []).map((menu) =>
      String(getId(menu)),
    );

    const subMenuKeys = (accessData.menu.subMenus || []).map(
      (sub) => sub.accessKey,
    );

    setAccessData((prev) => ({
      ...prev,

      menu: {
        ...prev.menu,
        selectedMenus: menuIds,
        selectedSubMenus: [...new Set(subMenuKeys)],
      },
    }));
  };

  /* ==========================================================
      CLEAR ALL MENUS
  ========================================================== */

  const handleClearAllMenus = () => {
    setAccessData((prev) => ({
      ...prev,

      menu: {
        ...prev.menu,
        selectedMenus: [],
        selectedSubMenus: [],
      },
    }));
  };

  /* ==========================================================
      EXPAND ALL
  ========================================================== */

  const handleExpandAll = () => {
    const expanded = {};

    (accessData.menu.menus || []).forEach((menu) => {
      const menuId = getId(menu);

      expanded[String(menuId)] = true;
    });

    setExpandedMenus(expanded);
  };

  const isAllMenusExpanded = useMemo(() => {
    const menus = accessData.menu.menus || [];

    if (menus.length === 0) {
      return false;
    }

    return menus.every((menu) => expandedMenus[String(getId(menu))] === true);
  }, [accessData.menu.menus, expandedMenus]);

  /* ==========================================================
      COLLAPSE ALL
  ========================================================== */

  const handleCollapseAll = () => {
    setExpandedMenus({});
  };

  /* ==========================================================
      GENERIC ACCESS CHANGE
  ========================================================== */

  const handleAccessChange = (type, itemId, checked) => {
    setAccessData((prev) => {
      const currentSelected = [...(prev[type]?.selected || [])];

      const normalizedId = String(itemId);

      let selected;

      if (checked) {
        selected = currentSelected.some((id) => String(id) === normalizedId)
          ? currentSelected
          : [...currentSelected, normalizedId];
      } else {
        selected = currentSelected.filter((id) => String(id) !== normalizedId);
      }

      return {
        ...prev,

        [type]: {
          ...prev[type],
          selected,
        },
      };
    });
  };

  /* ==========================================================
      SELECT ALL GENERIC ACCESS
  ========================================================== */

  const handleSelectAllAccess = (type) => {
    const items = accessData[type]?.items || [];

    const ids = items.map((item) => String(getId(item)));

    setAccessData((prev) => ({
      ...prev,

      [type]: {
        ...prev[type],
        selected: [...new Set(ids)],
      },
    }));
  };

  /* ==========================================================
      CLEAR ALL GENERIC ACCESS
  ========================================================== */

  const handleClearAllAccess = (type) => {
    setAccessData((prev) => ({
      ...prev,

      [type]: {
        ...prev[type],
        selected: [],
      },
    }));
  };

  /* ==========================================================
    RESET ENTIRE PAGE
  ========================================================== */

  const resetPage = () => {
    setSelectedProfile(null);
    setAccessData(getInitialAccessData());
    setExpandedMenus({});
    setMenuSearch("");
    setActiveTab("menu");
  };

  /* ==========================================================
    RESET ENTIRE PAGE
  ========================================================== */

  const resetEntirePage = () => {
    setSelectedProfile(null);

    setAccessData({
      menu: {
        menus: [],
        subMenus: [],
        selectedMenus: [],
        selectedSubMenus: [],
      },

      company: {
        items: [],
        selected: [],
      },

      division: {
        items: [],
        selected: [],
      },

      department: {
        items: [],
        selected: [],
      },

      task: {
        items: [],
        selected: [],
      },

      dashboard: {
        items: [],
        selected: [],
      },
    });

    setExpandedMenus({});
    setMenuSearch("");
    setActiveTab("menu");
  };

  const handleSaveTab = async (type) => {
    /* ==========================================================
     VALIDATE PROFILE
  ========================================================== */

    if (
      selectedProfile === null ||
      selectedProfile === undefined ||
      selectedProfile === ""
    ) {
      notifyWarning("Please select a profile.");
      return;
    }

    /* ==========================================================
     VALID ACCESS TYPES
  ========================================================== */

    const allowedAccessTypes = [
      "menu",
      "company",
      "division",
      "department",
      "task",
      "dashboard",
    ];

    if (!allowedAccessTypes.includes(type)) {
      notifyError(`Invalid access type: ${type}`);
      return;
    }

    /* ==========================================================
     TAB NAMES
  ========================================================== */

    const tabNames = {
      menu: "Menu Access",
      company: "Company Access",
      division: "Division Access",
      department: "Department Access",
      task: "Task Access",
      dashboard: "Dashboard Access",
    };

    const tabName = tabNames[type];

    /* ==========================================================
     CONFIRM
  ========================================================== */

    const confirmed = await confirmAction(
      `Save ${tabName}?`,
      `Are you sure you want to save ${tabName.toLowerCase()} for this profile?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      /* ========================================================
       BASE PAYLOAD
       ======================================================== */

      const payload = {
        profileId: String(selectedProfile),
        accessType: type,
      };

      /* ========================================================
       MENU
       ======================================================== */

      if (type === "menu") {
        const subMenuIds = (accessData.menu.selectedSubMenus || [])
          .map((accessKey) => {
            const subMenu = (accessData.menu.subMenus || []).find(
              (item) => item.accessKey === accessKey,
            );

            return subMenu?.id;
          })
          .filter((id) => id !== null && id !== undefined && id !== "")
          .map(String);

        payload.subMenuIds = [...new Set(subMenuIds)];
      }

      /* ========================================================
       COMPANY
       ======================================================== */

      if (type === "company") {
        payload.companyIds = [
          ...new Set(
            (accessData.company.selected || []).map(String).filter(Boolean),
          ),
        ];
      }

      /* ========================================================
       DIVISION
       ======================================================== */

      if (type === "division") {
        payload.divisionIds = [
          ...new Set(
            (accessData.division.selected || []).map(String).filter(Boolean),
          ),
        ];
      }

      /* ========================================================
       DEPARTMENT
       ======================================================== */

      if (type === "department") {
        payload.departmentIds = [
          ...new Set(
            (accessData.department.selected || []).map(String).filter(Boolean),
          ),
        ];
      }

      /* ========================================================
       TASK
       ======================================================== */

      if (type === "task") {
        payload.taskIds = [
          ...new Set(
            (accessData.task.selected || []).map(String).filter(Boolean),
          ),
        ];
      }

      /* ========================================================
       DASHBOARD
       ======================================================== */

      if (type === "dashboard") {
        payload.dashboardIds = [
          ...new Set(
            (accessData.dashboard.selected || []).map(String).filter(Boolean),
          ),
        ];
      }

      /* ========================================================
       DEBUG
       ======================================================== */

      console.log(
        "saveProfileAccess payload:",
        JSON.stringify(payload, null, 2),
      );

      /* ========================================================
       API CALL
       ======================================================== */

      const res = await saveProfileAccess(payload);

      /* ========================================================
       RESPONSE
       ======================================================== */

      if (res?.status) {
        notifySuccess(res?.message || `${tabName} saved successfully.`);
      } else {
        notifyError(res?.message || `Unable to save ${tabName.toLowerCase()}.`);
      }
    } catch (error) {
      console.error(`Save ${type} access error:`, error);

      notifyError(error?.message || `Unable to save ${tabName.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
      RENDER GENERIC ACCESS TAB
  ========================================================== */

  const renderAccessTab = (type, title, itemLabelKey) => {
    const items = accessData[type]?.items || [];

    const selected = accessData[type]?.selected || [];

    const allSelected = items.length > 0 && selected.length === items.length;

    return (
      <div className="profile-access-section">
        {" "}
        sdadsad
        {/* ==================================================
            HEADER
        ================================================== */}
        <div className="profile-access-toolbar">
          <div className="profile-access-title">
            <div className="form-check profile-parent-checkbox">
              <input
                id={`${type}-all`}
                className="form-check-input"
                type="checkbox"
                checked={allSelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleSelectAllAccess(type);
                  } else {
                    handleClearAllAccess(type);
                  }
                }}
              />

              <label htmlFor={`${type}-all`} className="form-check-label">
                {title}
              </label>
            </div>
          </div>

          <div className="profile-access-actions">
            <button
              type="button"
              className="btn btn-outline-success btn-sm"
              onClick={() => handleSelectAllAccess(type)}
            >
              Select All
            </button>

            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => handleClearAllAccess(type)}
            >
              Clear All
            </button>
          </div>
        </div>
        {/* ==================================================
            ITEMS
        ================================================== */}
        <div className="profile-access-grid">
          {items.length === 0 ? (
            <div className="text-muted py-4 text-center">
              No {title.toLowerCase()} found.
            </div>
          ) : (
            items.map((item) => {
              const id = getId(item);

              const label = getLabel(item, itemLabelKey);

              const checked = selected.some(
                (selectedId) => String(selectedId) === String(id),
              );

              return (
                <div
                  key={`${type}-${id}`}
                  className="profile-access-item form-check"
                >
                  <input
                    id={`${type}-${id}`}
                    className="form-check-input"
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      handleAccessChange(type, id, e.target.checked)
                    }
                  />

                  <label htmlFor={`${type}-${id}`} className="form-check-label">
                    {label}
                  </label>
                </div>
              );
            })
          )}
        </div>
        {/* SAVE THIS TAB ONLY */}
        <div className="text-center mt-4">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSaveTab(type)}
            disabled={saving || loadingAccess || !selectedProfile}
          >
            {saving ? (
              <>
                <span className="save-button-loading">
                  <span
                    className="spinner-border save-spinner"
                    role="status"
                    aria-hidden="true"
                  />
                  <span>Saving...</span>
                </span>
              </>
            ) : (
              <>
                <i className="ti ti-device-floppy me-1" />
                Save {title} Access
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  /* ==========================================================
      RENDER
  ========================================================== */

  return (
    <>
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Profile Maintenance</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            {
              text: "Home",
              link: portalHome,
            },
            {
              text: "Profile Maintenance",
            },
          ]}
        />
      </div>

      {/* ======================================================
          MAIN CARD
      ====================================================== */}

      <div className="card hrms-profile-maintenance">
        <div className="card-body">
          {/* ==================================================
              PROFILE SELECT
          ================================================== */}

          <div className="profile-selection-row mb-4">
            <div className="profile-selection-controls">
              <Dropdown
                value={selectedProfile}
                options={profileOptions}
                onChange={(e) => {
                  if (
                    e.value === null ||
                    e.value === undefined ||
                    e.value === ""
                  ) {
                    resetPage();
                    return;
                  }

                  setSelectedProfile(e.value);
                }}
                placeholder="Select Profile"
                className="profile-dropdown"
                showClear
                filter
                disabled={loadingProfiles || loadingAccess || saving}
              />

              <button
                type="button"
                className="btn btn-outline-secondary profile-reset-btn"
                onClick={resetPage}
                disabled={loadingAccess || saving || !selectedProfile}
              >
                <i className="ti ti-refresh me-1" />
                Reset
              </button>
            </div>
          </div>

          {/* ==================================================
              TABS
          ================================================== */}
          {selectedProfile && (
            <>
              <div className="profile-tabs-wrapper">
                <ul className="nav nav-tabs hrms-profile-tabs">
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${activeTab === "menu" ? "active" : ""}`}
                      onClick={() => setActiveTab("menu")}
                    >
                      Menu Access
                    </button>
                  </li>

                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${
                        activeTab === "company" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("company")}
                    >
                      Company Access
                    </button>
                  </li>

                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${
                        activeTab === "division" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("division")}
                    >
                      Division Access
                    </button>
                  </li>

                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${
                        activeTab === "department" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("department")}
                    >
                      Department Access
                    </button>
                  </li>

                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${activeTab === "task" ? "active" : ""}`}
                      onClick={() => setActiveTab("task")}
                    >
                      Task Access
                    </button>
                  </li>

                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${
                        activeTab === "dashboard" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("dashboard")}
                    >
                      Dashboard Access
                    </button>
                  </li>
                </ul>
              </div>

              {/* ==================================================
              TAB CONTENT
          ================================================== */}

              <div className="profile-tab-content">
                {loadingAccess ? (
                  <div className="text-center py-5">
                    <div
                      className="spinner-border text-warning"
                      role="status"
                    />

                    <div className="mt-2 text-muted">
                      Loading profile access...
                    </div>
                  </div>
                ) : (
                  <>
                    {/* ==================================================
                    MENU ACCESS
                ================================================== */}

                    {activeTab === "menu" && (
                      <div className="profile-menu-access">
                        {/* Toolbar */}

                        <div className="profile-menu-toolbar">
                          <div className="profile-menu-search">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Search menu..."
                              value={menuSearch}
                              onChange={(e) => setMenuSearch(e.target.value)}
                            />
                          </div>

                          <div className="profile-menu-actions">
                            <button
                              type="button"
                              className={`btn btn-sm ${
                                isAllMenusExpanded
                                  ? "btn-primary"
                                  : "btn-outline-primary"
                              }`}
                              onClick={handleExpandAll}
                            >
                              Expand All
                            </button>

                            <button
                              type="button"
                              className="btn btn-outline-warning btn-sm"
                              onClick={handleCollapseAll}
                            >
                              Collapse All
                            </button>

                            <button
                              type="button"
                              className="btn btn-outline-success btn-sm"
                              onClick={handleSelectAllMenus}
                            >
                              Select All
                            </button>

                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={handleClearAllMenus}
                            >
                              Clear All
                            </button>
                          </div>
                        </div>

                        {/* Menu list */}

                        <div className="profile-menu-list">
                          {filteredMenus.length === 0 ? (
                            <div className="text-center text-muted py-4">
                              No menus found.
                            </div>
                          ) : (
                            filteredMenus.map((menu) => {
                              const menuId = getId(menu);

                              const menuLabel = getLabel(menu);

                              const subMenus = getSubMenus(menuId);

                              const expanded = !!expandedMenus[String(menuId)];

                              const selected = isMenuSelected(menuId);

                              return (
                                <div
                                  key={`menu-${String(menuId)}`}
                                  className="profile-menu-row"
                                >
                                  {/* ==================================================
                                    PARENT
                                ================================================== */}

                                  <div className="profile-menu-parent">
                                    <div className="profile-menu-parent-left">
                                      <div className="form-check mb-0">
                                        <input
                                          id={`menu-${menuId}`}
                                          className="form-check-input"
                                          type="checkbox"
                                          checked={selected}
                                          onChange={(e) =>
                                            handleMenuChange(
                                              menuId,
                                              e.target.checked,
                                            )
                                          }
                                        />
                                      </div>

                                      {subMenus.length > 0 && (
                                        <button
                                          type="button"
                                          className="profile-menu-expand"
                                          onClick={() => toggleMenu(menuId)}
                                        >
                                          <FontAwesomeIcon
                                            icon={
                                              expanded
                                                ? faChevronDown
                                                : faChevronRight
                                            }
                                          />
                                        </button>
                                      )}

                                      <label
                                        htmlFor={`menu-${menuId}`}
                                        className="profile-menu-label"
                                      >
                                        {menuLabel}
                                      </label>
                                    </div>
                                  </div>

                                  {/* ==================================================
                                    SUBMENUS
                                ================================================== */}

                                  {expanded && subMenus.length > 0 && (
                                    <div className="profile-submenu-container">
                                      {subMenus.map((subMenu) => {
                                        const subMenuId = getId(subMenu);
                                        const subMenuLabel = getLabel(subMenu);

                                        return (
                                          <div
                                            key={subMenu.accessKey}
                                            className="profile-submenu-item form-check"
                                          >
                                            <input
                                              id={`submenu-${subMenu.accessKey}`}
                                              className="form-check-input"
                                              type="checkbox"
                                              checked={isSubMenuSelected(
                                                subMenu,
                                              )}
                                              onChange={(e) =>
                                                handleSubMenuChange(
                                                  menuId,
                                                  subMenu,
                                                  e.target.checked,
                                                )
                                              }
                                            />

                                            <label
                                              htmlFor={`submenu-${subMenu.accessKey}`}
                                              className="form-check-label"
                                            >
                                              {subMenuLabel}
                                            </label>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>

                        <div className="text-center mt-4">
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handleSaveTab("menu")}
                            disabled={
                              saving || loadingAccess || !selectedProfile
                            }
                          >
                            {saving ? (
                              <span className="save-button-loading">
                                <span
                                  className="spinner-border save-spinner"
                                  role="status"
                                  aria-hidden="true"
                                />
                                <span>Saving...</span>
                              </span>
                            ) : (
                              <>
                                <i className="ti ti-device-floppy me-1" />
                                Save Menu Access
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ==================================================
                    COMPANY ACCESS
                ================================================== */}

                    {activeTab === "company" &&
                      renderAccessTab("company", "Company", "description")}

                    {/* ==================================================
                    DIVISION ACCESS
                ================================================== */}

                    {activeTab === "division" &&
                      renderAccessTab("division", "Divisions", "description")}

                    {/* ==================================================
                    DEPARTMENT ACCESS
                ================================================== */}

                    {activeTab === "department" &&
                      renderAccessTab(
                        "department",
                        "Department",
                        "description",
                      )}

                    {/* ==================================================
                    TASK ACCESS
                ================================================== */}

                    {activeTab === "task" &&
                      renderAccessTab("task", "Task", "label")}

                    {/* ==================================================
                    DASHBOARD ACCESS
                ================================================== */}

                    {activeTab === "dashboard" &&
                      renderAccessTab("dashboard", "Dashboard", "label")}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileMaintenance;
