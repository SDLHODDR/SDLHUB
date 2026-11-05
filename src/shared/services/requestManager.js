/* ---------------------------
   REQUEST MANAGER
---------------------------- */

let controllers = new Set();

/* CREATE */
export const createController = () => {
  const controller = new AbortController();
  controllers.add(controller);
  return {
    controller,
    cleanup: () => controllers.delete(controller)
  };
  //return controller;
};

/* REMOVE */
export const removeController = (controller) => {
  controllers.delete(controller);
};

/* CANCEL ALL */
export const cancelAllRequests = () => {
  controllers.forEach((controller) => controller.abort());
  controllers.clear();
};
