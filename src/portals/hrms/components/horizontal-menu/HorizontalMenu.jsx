import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import { getHrmsMenu } from "../../services/hrmsMenuService";
import { notifyError } from "../../../../services/alertService";

const HorizontalMenu = () => {
  const location = useLocation();

  const [menus, setMenus] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | FORMAT ROUTE
  |--------------------------------------------------------------------------
  */

  const formatRoute = (route) => {
    if (!route || typeof route !== "string") return "/hrms";

    const cleanRoute = route
      .trim()
      .replace(/^\/+/, "")
      .replace(/\\/g, "/")
      .replace(/\/+/g, "/")
      .replace(".php", "")
      .replaceAll("_", "-");

    return `/hrms/${cleanRoute}`;
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD MENU
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const res = await getHrmsMenu();

        if (res?.status) {
          setMenus(res.data || []);
        } else {
          notifyError(
            res?.message || "Unable to load HRMS menus."
          );
        }
      } catch (err) {
        notifyError(
          err?.message || "Unable to load HRMS menus."
        );
      }
    };

    loadMenus();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CHECK ACTIVE CHILD
  |--------------------------------------------------------------------------
  */

  const isChildActive = (route) => {
    const formattedRoute = formatRoute(route);

    return (
      location.pathname === formattedRoute ||
      location.pathname.startsWith(formattedRoute + "/")
    );
  };

  /*
  |--------------------------------------------------------------------------
  | TOGGLE MENU
  |--------------------------------------------------------------------------
  */

  const toggleMenu = (menuId) => {
    setOpenMenu((prev) =>
      prev === menuId ? null : menuId
    );
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE MOBILE MENU
  |--------------------------------------------------------------------------
  */

  const closeMobileMenu = () => {
    document
      .querySelector(".main-wrapper")
      ?.classList.remove("slide-nav");

    document
      .querySelector(".sidebar-overlay")
      ?.classList.remove("opened");

    document.documentElement.classList.remove(
      "menu-opened"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | MENU ITEMS
  |--------------------------------------------------------------------------
  */

  const renderMenuItems = (mobile = false) => {
    return menus.map((menu) => {
      const hasChildren =
        Array.isArray(menu.children) &&
        menu.children.length > 0;

      /*
       * IMPORTANT:
       *
       * Do NOT automatically use active route to open
       * the menu.
       *
       * The user controls open/close state.
       */

      const isOpen = openMenu === menu.id;

      return (
        <li
          key={`hrms-menu-${menu.id}`}
          className={`submenu ${
            isOpen ? "submenu-open" : ""
          }`}
        >
          {/* ==================================================
              PARENT MENU
          ================================================== */}

          <a
            href="#"
            className={`hrms-menu-link ${
              isOpen ? "hrms-menu-open" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();

              if (hasChildren) {
                toggleMenu(menu.id);
              }
            }}
          >
            <i
              className={
                menu.icon ||
                "ti ti-layout-grid fs-16 me-2"
              }
            />

            <span>{menu.label}</span>

            {hasChildren && (
              <span
                className={`menu-arrow ${
                  isOpen ? "hrms-arrow-open" : ""
                }`}
              />
            )}
          </a>

          {/* ==================================================
              CHILD MENU
          ================================================== */}

          {hasChildren && (
            <ul
              className="hrms-submenu"
              style={{
                display: isOpen ? "block" : "none",
              }}
            >
              {menu.children.map((child, index) => {
                const childRoute = child.url || child.route || child.path;
                const active = isChildActive(childRoute);
                const childKey = `hrms-submenu-${menu.id}-${child.id || "child"}-${child.label || "item"}-${childRoute || index}`;
                const uniqueKey = `${childKey}-${index}`;

                return (
                  <li
                    key={uniqueKey}
                    className={
                      active ? "hrms-child-active" : ""
                    }
                  >
                    <Link
                      to={formatRoute(childRoute)}
                      onClick={() => {
                        if (mobile) {
                          closeMobileMenu();
                        }
                      }}
                    >
                      <span>{child.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    });
  };

  return (
    <>
      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

      <div
        className="sidebar hrms-mobile-sidebar"
        id="sidebar"
      >
        <div className="sidebar-inner slimscroll">
          <div
            id="sidebar-menu"
            className="sidebar-menu"
          >
            <ul>
              {renderMenuItems(true)}
            </ul>
          </div>
        </div>
      </div>

      {/* =====================================================
          DESKTOP HORIZONTAL MENU
      ===================================================== */}

      <div
        className="sidebar sidebar-horizontal"
        id="horizontal-menu"
      >
        <div
          id="sidebar-menu-3"
          className="sidebar-menu"
        >
          <div className="main-menu">
            <ul className="nav-menu">
              {renderMenuItems(false)}
            </ul>
          </div>
        </div>
      </div>

      {/* =====================================================
          OVERLAY
      ===================================================== */}

      <div
        className="sidebar-overlay"
        onClick={closeMobileMenu}
      />
    </>
  );
};

export default HorizontalMenu;