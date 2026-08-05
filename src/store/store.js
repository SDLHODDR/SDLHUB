import { configureStore } from "@reduxjs/toolkit";
import ePortalAuthorizationCountReducer from "./eportal/ePortalAuthorizationCountSlice";
import ePortalAuthorizationDataReducer from "./eportal/ePortalAuthorizationDataSlice";
import ePortalOutdoorDutyReducer from "./eportal/ePortalOutdoorDutySlice";
import ePortalTicketBookingReducer from "./eportal/ePortalTicketBookingSlice";
import ePortalLeavesReducer from "./eportal/ePortalLeavesSlice";
import hrmsKRAActivityReducer from "./hrms/hrmsKRAActivitySlice";

export const store = configureStore({
  reducer: {
    eportalAuthCounts: ePortalAuthorizationCountReducer,
    eportalAuthData: ePortalAuthorizationDataReducer,
    eportalODData: ePortalOutdoorDutyReducer,
    eportalTBRData: ePortalTicketBookingReducer,
    eportalLRData: ePortalLeavesReducer,
    hrmsKRAAcivityData: hrmsKRAActivityReducer,
    // epp: eppReducer,
    // sfm: sfmReducer,
    // hrms: hrmsReducer,
  },
});