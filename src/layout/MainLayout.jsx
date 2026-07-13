import { useLocation, Outlet } from "react-router-dom";
import { useEffect } from "react";

import HeaderTop from "./HeaderTop";
import Footer from "./Footer";

import EportalMenu from "../portals/eportal/components/horizontal-menu/HorizontalMenu";
// import EppMenu from "../portals/epp/components/HorizontalMenu";

import { cancelAllRequests } from "../services/requestManager";

const MainLayout = () => {
  const location = useLocation();
  const portal = location.pathname.split("/")[1];

  const isPolicyPage = location.pathname === "/policy-acceptance";

  // Cancel pending API requests on route change
  useEffect(() => {
    cancelAllRequests();
  }, [location.pathname]);

  // Portal-specific layout classes
  useEffect(() => {
    document.body.classList.remove(
      "menu-horizontal",
      "eportal-layout",
      "epp-layout",
      "hrms-layout",
      "policy-layout"
    );

    document.documentElement.removeAttribute("data-layout");

    if (portal === "eportal") {
      document.body.classList.add(
        "menu-horizontal",
        "eportal-layout"
      );

      document.documentElement.setAttribute(
        "data-layout",
        "horizontal"
      );
    } else if (portal === "epp") {
      document.body.classList.add("epp-layout");
    }

    if (isPolicyPage) {
        document.body.classList.add("policy-layout");
    }

    return () => {
      document.body.classList.remove(
        "menu-horizontal",
        "eportal-layout",
        "epp-layout",
        "hrms-layout",
        "policy-layout"
      );
      document.documentElement.removeAttribute("data-layout");
    };
  }, [portal,isPolicyPage]);

  return (
    <div className="main-wrapper">
      <HeaderTop />
	  	
      {/* Portal Menu */}
      {portal === "eportal" && <EportalMenu />}
      {/* {portal === "epp" && <EppMenu />} */}  
      <div className="page-wrapper">
        <div className="content">
          <Outlet />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;
