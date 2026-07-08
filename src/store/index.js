import { configureStore } from "@reduxjs/toolkit";
import ePortalAuthorizationCountReducer from "./eportal/ePortalAuthorizationCountSlice";
import ePortalAuthorizationOutDoorDutySlice from "./eportal/ePortalAuthorizationOutDoorDutySlice";

export const store = configureStore({
  reducer: {
    eportalAuthCounts: ePortalAuthorizationCountReducer,
    eportalAuthOD: ePortalAuthorizationOutDoorDutySlice,
    // epp: eppReducer,
    // sfm: sfmReducer,
    // hrms: hrmsReducer,
  },
});