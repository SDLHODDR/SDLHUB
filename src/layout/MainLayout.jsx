import { useLocation, Outlet } from "react-router-dom";
import { useEffect } from "react";

import HeaderTop from "./HeaderTop";
import Footer from "./Footer";

import EportalMenu from "../portals/eportal/components/horizontal-menu/HorizontalMenu";
import HrmsMenu from "../portals/hrms/components/horizontal-menu/HorizontalMenu";

import { cancelAllRequests } from "../services/requestManager";
import { getPortalFromPath } from "../config/portalConfig";

const MainLayout = () => {
  const location = useLocation();

  const portal = getPortalFromPath(location.pathname);

  const isPolicyPage =
    location.pathname === "/policy-acceptance";

  /*
  |--------------------------------------------------------------------------
  | CANCEL PENDING REQUESTS ON ROUTE CHANGE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    cancelAllRequests();
  }, [location.pathname]);

  /*
  |--------------------------------------------------------------------------
  | PORTAL-SPECIFIC LAYOUT
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    // Remove previous portal layout classes
    body.classList.remove(
      "menu-horizontal",
      "eportal-layout",
      "epp-layout",
      "sfm-layout",
      "hrms-layout",
      "policy-layout"
    );

    html.removeAttribute("data-layout");

    /*
    |--------------------------------------------------------------------------
    | PORTAL LAYOUT
    |--------------------------------------------------------------------------
    */

    switch (portal.key) {
      case "eportal":
        body.classList.add(
          "menu-horizontal",
          "eportal-layout"
        );

        html.setAttribute(
          "data-layout",
          "horizontal"
        );
        break;

      case "epp":
        body.classList.add(
          "epp-layout"
        );

        // EPP will be configured later
        break;

      case "sfm":
        body.classList.add(
          "menu-horizontal",
          "sfm-layout"
        );

        html.setAttribute(
          "data-layout",
          "horizontal"
        );
        break;

      case "hrms":
        body.classList.add(
          "menu-horizontal",
          "hrms-layout"
        );

        html.setAttribute(
          "data-layout",
          "horizontal"
        );
        break;

      default:
        break;
    }

    /*
    |--------------------------------------------------------------------------
    | POLICY PAGE
    |--------------------------------------------------------------------------
    */

    if (isPolicyPage) {
      body.classList.add("policy-layout");
    }

    /*
    |--------------------------------------------------------------------------
    | CLEANUP
    |--------------------------------------------------------------------------
    */

    return () => {
      body.classList.remove(
        "menu-horizontal",
        "eportal-layout",
        "epp-layout",
        "sfm-layout",
        "hrms-layout",
        "policy-layout"
      );

      html.removeAttribute("data-layout");
    };
  }, [portal.key, isPolicyPage]);

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="main-wrapper">

      {/* =========================================================
          TOP HEADER
      ========================================================= */}

      <HeaderTop />

      {/* =========================================================
          PORTAL MENU
      ========================================================= */}

      {portal.key === "eportal" && (
        <EportalMenu />
      )}

      {portal.key === "hrms" && (
        <HrmsMenu />
      )}

      {/* EPP menu will be added later */}
      {/* {portal.key === "epp" && <EppMenu />} */}

      {/* =========================================================
          PAGE CONTENT
      ========================================================= */}

      <div className="page-wrapper">
        <div className="content">
          <Outlet />
        </div>
      </div>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <Footer />

    </div>
  );
};

export default MainLayout;