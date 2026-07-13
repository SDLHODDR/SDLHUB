import { Link, useNavigate, useLocation } from "react-router-dom";
import { LOGOS, STOREIMAGES } from "../assets/assets";
import { useEffect, useState, useContext } from "react";
import AuthContext from "../auth/AuthContext";

import AuthorizationDropdown from "../components/authorization/AuthorizationDropdown";
import { useDispatch, useSelector } from "react-redux";
import { getAuthroizationTaskCount } from "../store/eportal/ePortalAuthorizationCountSlice";

const HeaderTop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [headerImage, setHeaderImage] = useState("");

  const successCnt = useSelector((state) => state.eportalAuthCounts.success);
  // const countData = useSelector((state) => state.eportalAuthCounts.data);
  const dispatch = useDispatch();
  console.log("==========SuccessCNT============", successCnt);  
  useEffect(() => {
    dispatch(getAuthroizationTaskCount());
  }, [dispatch]);

  

  useEffect(() => {
    if (user?.profile_image) {
      setHeaderImage(`${user.profile_image}?v=${new Date().getTime()}`);
    }
  }, [user?.profile_image]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  //Mobile Menu starts
  const sidebarOverlay = () => {
    document?.querySelector(".main-wrapper")?.classList?.toggle("slide-nav");
    document?.querySelector(".sidebar-overlay")?.classList?.toggle("opened");
    document?.querySelector("html")?.classList?.toggle("menu-opened");
  };
  useEffect(() => {
    document.querySelector(".main-wrapper")?.classList.remove("slide-nav");
    document.querySelector(".sidebar-overlay")?.classList.remove("opened");
    document.querySelector("html")?.classList.remove("menu-opened");
  }, [location.pathname]);

  //Mobile Menu ends
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement ||
          document.mozFullScreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement,
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

  const toggleFullscreen = (elem) => {
    const doc = document;
    elem = elem || document.documentElement;
    if (
      !doc.fullscreenElement &&
      !doc.mozFullScreenElement &&
      !doc.webkitFullscreenElement &&
      !doc.msFullscreenElement
    ) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(1);
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      }
    }
  };

  

  return (
    <div className="header">
      <div className="main-header">
        {/* Logo Section */}
        <div className="header-left active">
          <Link to="/eportal/dashboard" className="logo logo-normal">
            <img src={LOGOS.MAIN} alt="Img" style={{ width: 90 }} />
          </Link>

          <Link to="/eportal/dashboard" className="logo logo-white">
            <img src={LOGOS.MAIN} alt="Img" />
          </Link>

          <Link to="/eportal/dashboard" className="logo-small">
            <img src={LOGOS.MAIN} alt="Img" />
          </Link>
        </div>

        <Link
          id="mobile_btn"
          className="mobile_btn"
          to="#"
          onClick={sidebarOverlay}
        >
          <span className="bar-icon">
            <span />
            <span />
            <span />
          </span>
        </Link>

        <ul className="nav user-menu">
          {/* Search */}
          <li className="nav-item nav-searchinputs ">
            <div className="top-nav-search d-none">
              <div className="searchinputs input-group">
                <input type="text" placeholder="Search" />
                <div className="search-addon">
                  <span>
                    <i className="ti ti-search"></i>
                  </span>
                </div>
              </div>
            </div>
          </li>

          {/* Select Store */}
          <li className="nav-item dropdown has-arrow main-drop select-store-dropdown d-none">
            <Link
              to="#"
              className="dropdown-toggle nav-link select-store"
              data-bs-toggle="dropdown"
            >
              <span className="user-info">
                <span className="user-letter">
                  <img
                    src={STOREIMAGES.STORE.STORE_01}
                    alt="Store Logo"
                    className="img-fluid"
                  />
                </span>
                <span className="user-detail">
                  <span className="user-name">Freshmart</span>
                </span>
              </span>
            </Link>
            <div className="dropdown-menu dropdown-menu-right">
              <Link to="#" className="dropdown-item">
                <img
                  src={STOREIMAGES.STORE.STORE_01}
                  alt="Store Logo"
                  className="img-fluid"
                />
                Freshmart
              </Link>
              <Link to="#" className="dropdown-item">
                <img
                  src={STOREIMAGES.STORE.STORE_02}
                  alt="Store Logo"
                  className="img-fluid"
                />
                Grocery Apex
              </Link>
              <Link to="#" className="dropdown-item">
                <img
                  src={STOREIMAGES.STORE.STORE_03}
                  alt="Store Logo"
                  className="img-fluid"
                />
                Grocery Bevy
              </Link>
              <Link to="#" className="dropdown-item">
                <img
                  src={STOREIMAGES.STORE.STORE_04}
                  alt="Store Logo"
                  className="img-fluid"
                />
                Grocery Eden
              </Link>
            </div>
          </li>
          {/* /Select Store */}

          {/* <AuthorizationSettings /> */}

          { 
            successCnt && <AuthorizationDropdown />
          }  
          

          <li className="nav-item nav-item-box">
            <Link
              to="#"
              id="btnFullscreen"
              onClick={() => toggleFullscreen()}
              className={isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
            >
              {/* <i data-feather="maximize" /> */}
              <i className="ti ti-maximize"></i>
            </Link>
          </li>

          {/* Profile Dropdown */}
          <li className="nav-item dropdown has-arrow main-drop profile-nav">
            <a href="#!" className="nav-link userset" data-bs-toggle="dropdown">
              <span className="user-info p-0">
                <span className="user-letter">
                  <img
                    src={headerImage || STOREIMAGES.PROFILE.AVATAR_1}
                    alt="Profile"
                    className="img-fluid"
                  />
                </span>
              </span>
            </a>

            <div className="dropdown-menu menu-drop-user">
              <div className="profileset d-flex align-items-center">
                <span className="user-img me-2">
                  <img
                    src={headerImage || STOREIMAGES.PROFILE.AVATAR_1}
                    alt="Profile"
                  />
                </span>
                <div>
                  <h6 className="fw-medium">{user?.name || "Guest User"}</h6>
                  <p>{user?.empcode || "User"}</p>
                </div>
              </div>

              <Link className="dropdown-item" to="eportal/my-profile">
                <i className="ti ti-user-circle me-2"></i>MyProfile
              </Link>
              {/*}
              <Link className="dropdown-item" to="/reports">
                <i className="ti ti-file-text me-2"></i>Reports
              </Link> */}

              {/*<Link className="dropdown-item" to="/settings">
                <i className="ti ti-settings-2 me-2"></i>Settings
              </Link>*/}

              <hr className="my-2" />

              <button
                type="button"
                className="dropdown-item logout pb-0 bg-transparent border-0"
                onClick={handleLogout}
              >
                <i className="ti ti-logout me-2"></i>Logout
              </button>
            </div>
          </li>
        </ul>

        {/* Mobile Dropdown */}
        <div className="dropdown mobile-user-menu">
          <a
            href="#!"
            className="nav-link dropdown-toggle"
            data-bs-toggle="dropdown"
          >
            <i className="fa fa-ellipsis-v"></i>
          </a>

          <div className="dropdown-menu dropdown-menu-right">
            <Link className="dropdown-item" to="/profile">
              My Profile
            </Link>
            {/*<Link className="dropdown-item" to="/settings">
              Settings
            </Link>*/}
            <button
              type="button"
              className="dropdown-item bg-transparent border-0"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderTop;
