// src/assets/assets.js

// Import Icons
//import hamburgerIcon from "./img/icons/hamburger.svg"; //./img/icons/hamburger.svg
import fullscreenIcon from "./img/icons/fullscreen.svg";
import notificationIcon from "./img/icons/notification-bing.svg";
import settingsIcon from "./img/icons/settings.svg";
import userIcon from "./img/icons/user.svg";

// Import Logos
import mainLogo from "./img/logo/sdl-logo.png";

// Logos
import logo from "./img/logo/SDL.jpg";

//mobile view logo
import mobilelogo from "./img/logo.svg";

// Import Images
import userAvatar from "./img/avatar/avatar-1.jpg";
import authenticationImg from "./img/authentication/authentication-01.svg";
import authenticationImg3 from "./img/authentication/authentication-03.svg";
import error404Img from "./img/authentication/error-404.png";

// Stores
import store01 from "./img/store/store-01.png";
import store02 from "./img/store/store-02.png";
import store03 from "./img/store/store-03.png";
import store04 from "./img/store/store-04.png";

// Profiles
import avatar1 from "./img/profiles/avator1.jpg";


export { default as pdf } from "./img/icons/pdf.svg";
export { default as excel } from "./img/icons/excel.svg";


export const ICONS = {
  //HAMBURGER : hamburgerIcon,
  FULLSCREEN: fullscreenIcon,
  NOTIFICATION: notificationIcon,
  SETTINGS: settingsIcon,
  USER: userIcon,
};

export const LOGOS = {
  MAIN: mainLogo,
  LOGO: logo,
  MOBILE_LOGO: mobilelogo,
};

export const IMAGES = {
  USERAVATAR: userAvatar,
  AUTHENTICATION: authenticationImg,
  AUTHENTICATION03:authenticationImg3,  
  ERROR_404: error404Img,
};

export const STOREIMAGES = {
  STORE: {
    STORE_01: store01,
    STORE_02: store02,
    STORE_03: store03,
    STORE_04: store04,
  },
  PROFILE: {
    AVATAR_1: avatar1,
  },
};
