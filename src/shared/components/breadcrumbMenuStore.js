/*
 * The portal menus publish their routes here so BreadcrumbNav can show
 * Home / Main menu / Sub menu for whichever page is open.
 * Entries: { path: '/hrms/...', main: 'Masters', sub: 'Employee Data' }
 */
const menuTrails = {};
const listeners = new Set();
let version = 0;

export const setPortalMenuTrail = (portalKey, entries) => {
  menuTrails[portalKey] = entries || [];
  version += 1;
  listeners.forEach((listener) => listener());
};

export const getPortalMenuTrail = (portalKey) => menuTrails[portalKey] || [];

export const subscribeMenuTrail = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getMenuTrailVersion = () => version;

// Exact route first, otherwise the longest menu route the path sits under.
export const findMenuEntry = (portalKey, pathname) => {
  const path = (pathname || '').replace(/\/+$/, '').toLowerCase();
  let best = null;
  getPortalMenuTrail(portalKey).forEach((entry) => {
    const route = (entry.path || '').replace(/\/+$/, '').toLowerCase();
    if (!route) return;
    if (route === path) {
      best = { ...entry, exact: true };
      return;
    }
    if (path.startsWith(`${route}/`) && !best?.exact && (!best || route.length > best.path.length)) {
      best = { ...entry, exact: false };
    }
  });
  return best;
};
