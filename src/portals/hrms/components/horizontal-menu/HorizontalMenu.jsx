import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";

import { getHrmsMenu } from "../../services/hrmsMenuService";
import { notifyError } from "../../../../services/alertService";

const STORAGE_KEY = "HRMS_MENU_CACHE";

/*
|--------------------------------------------------------------------------
| ROUTE FORMATTER (Pure function outside component to avoid recreation)
|--------------------------------------------------------------------------
*/
const cleanRoutePath = (route) => {
  if (!route || typeof route !== "string") return "/hrms";

  const clean = route
    .trim()
    .replace(/^\/+/, "")
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/\.php$/i, "")
    .replaceAll("_", "-");

  return `/hrms/${clean}`;
};

const HorizontalMenu = () => {
  const location = useLocation();

  /*
  |--------------------------------------------------------------------------
  | INSTANT INITIALIZATION FROM LOCAL CACHE
  |--------------------------------------------------------------------------
  */
  const [menus, setMenus] = useState(() => {
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [openMenu, setOpenMenu] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | PRE-PROCESS & NORMALIZE MENU DATA (Pre-computes routes once)
  |--------------------------------------------------------------------------
  */
  const processedMenus = useMemo(() => {
    return menus.map((menu) => ({
      ...menu,
      children: (menu.children || []).map((child) => ({
        ...child,
        targetRoute: cleanRoutePath(child.url || child.route || child.path),
      })),
    }));
  }, [menus]);

  /*
  |--------------------------------------------------------------------------
  | LOAD MENU IN BACKGROUND (Stale-While-Revalidate)
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    let isMounted = true;

    const loadMenus = async () => {
      try {
        const res = await getHrmsMenu();

        if (res?.status && isMounted) {
          const freshData = res.data || [];
          setMenus(freshData);
          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(freshData));
          } catch (e) {
            console.warn("Unable to save menu cache:", e);
          }
        } else if (!res?.status && isMounted) {
          notifyError(res?.message || "Unable to load HRMS menus.");
        }
      } catch (err) {
        if (isMounted) {
          notifyError(err?.message || "Unable to load HRMS menus.");
        }
      }
    };

    loadMenus();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CLOSE MENU ON ROUTE CHANGE
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    setOpenMenu(null);
  }, [location.pathname]);

  /*
  |--------------------------------------------------------------------------
  | HANDLERS
  |--------------------------------------------------------------------------
  */
  const toggleMenu = useCallback((menuId) => {
    setOpenMenu((prev) => (prev === menuId ? null : menuId));
  }, []);

  const closeMobileMenu = useCallback(() => {
    document.querySelector(".main-wrapper")?.classList.remove("slide-nav");
    document.querySelector(".sidebar-overlay")?.classList.remove("opened");
    document.documentElement.classList.remove("menu-opened");
  }, []);

  const isChildActive = useCallback(
    (targetRoute) => {
      return (
        location.pathname === targetRoute ||
        location.pathname.startsWith(targetRoute + "/")
      );
    },
    [location.pathname]
  );

  /*
  |--------------------------------------------------------------------------
  | RENDER MENU LIST
  |--------------------------------------------------------------------------
  */
  const renderMenuItems = (mobile = false) => {
    return processedMenus.map((menu) => {
      const hasChildren = menu.children.length > 0;
      const isOpen = openMenu === menu.id;

      return (
        <li
          key={`hrms-menu-${mobile ? "mob" : "desk"}-${menu.id}`}
          className={`submenu ${isOpen ? "submenu-open" : ""}`}
        >
          <a
            href="#"
            className={`hrms-menu-link ${isOpen ? "hrms-menu-open" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              if (hasChildren) {
                toggleMenu(menu.id);
              }
            }}
          >
            <i className={menu.icon || "ti ti-layout-grid fs-16 me-2"} />
            <span>{menu.label}</span>
            {hasChildren && (
              <span
                className={`menu-arrow ${isOpen ? "hrms-arrow-open" : ""}`}
              />
            )}
          </a>

          {hasChildren && (
            <ul
              className="hrms-submenu"
              style={{ display: isOpen ? "block" : "none" }}
            >
              {menu.children.map((child, index) => {
                const active = isChildActive(child.targetRoute);

                return (
                  <li
                    key={`hrms-sub-${menu.id}-${child.id || index}`}
                    className={active ? "hrms-child-active" : ""}
                  >
                    <Link
                      to={child.targetRoute}
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
      {/* MOBILE SIDEBAR */}
      <div className="sidebar hrms-mobile-sidebar" id="sidebar">
        <div className="sidebar-inner slimscroll">
          <div id="sidebar-menu" className="sidebar-menu">
            <ul>{renderMenuItems(true)}</ul>
          </div>
        </div>
      </div>

      {/* DESKTOP HORIZONTAL MENU */}
      <div className="sidebar sidebar-horizontal" id="horizontal-menu">
        <div id="sidebar-menu-3" className="sidebar-menu">
          <div className="main-menu">
            <ul className="nav-menu">{renderMenuItems(false)}</ul>
          </div>
        </div>
      </div>

      {/* OVERLAY */}
      <div className="sidebar-overlay" onClick={closeMobileMenu} />
    </>
  );
};

export default HorizontalMenu;