export const PORTALS = {
  eportal: {
    key: "eportal",
    label: "EPORTAL",
    path: "/eportal/dashboard",
    layout: "horizontal",
  },
/*
  epp: {
    key: "epp",
    label: "EPP",
    path: "/epp/dashboard",
    layout: "horizontal-sidebar",
  },

  sfm: {
    key: "sfm",
    label: "SFM",
    path: "/sfm/dashboard",
    layout: "horizontal",
  },*/

  hrms: {
    key: "hrms",
    label: "HRMS",
    path: "/hrms/dashboard",
    layout: "horizontal",
  },
};

export const getPortalFromPath = (pathname) => {
  const portal = pathname.split("/")[1];

  return PORTALS[portal] || PORTALS.eportal;
};
