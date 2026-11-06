/* ---------------------------
   REQUEST MANAGER
---------------------------- */

let controllers = new Set();

/* CREATE */
export const createController = () => {
  const controller = new AbortController();
  controllers.add(controller);
  return controller;
};

/* REMOVE */
export const removeController = (controller) => {
  controllers.delete(controller);
};

/* CANCEL ALL
   Only for when the app is about to leave the page (logout, session expiry).
   Don't call it on a route change: parent effects run after child effects, so
   it would also abort the requests the new page has just started. */
let cancelledAll = false;

export const hasCancelledAllRequests = () => cancelledAll;

export const cancelAllRequests = () => {
  cancelledAll = true;
  controllers.forEach((controller) => controller.abort());
  controllers.clear();
};
