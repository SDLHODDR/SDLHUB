import { configureStore } from "@reduxjs/toolkit";
import ePortalAuthorizationCountReducer from "./eportal/ePortalAuthorizationCountSlice";
import ePortalAuthorizationDataReducer from "./eportal/ePortalAuthorizationDataSlice";
import ePortalOutdoorDutyReducer from "./eportal/ePortalOutdoorDutySlice";
import ePortalTicketBookingReducer from "./eportal/ePortalTicketBookingSlice";
import ePortalLeavesReducer from "./eportal/ePortalLeavesSlice";
import hrmsKRAActivityReducer from "./hrms/hrmsKRAActivitySlice";
import hrmsQuestionMasterReducer from "./hrms/hrmsQuestionMasterSlice"; // <-- add this
import hrmsCapabilitiesReducer from "./hrms/hrmsCapabilitiesSlice";
import hrmsDeptActivitiesReducer from "./hrms/hrmsDeptActivitySlice";
import hrmsPoliciesReducer from "./hrms/hrmsPolicySlice";
import hrmsAuthorizationCountReducer from "./hrms/hrmsAuthorizationCountSlice";

export const store = configureStore({
  reducer: {
    eportalAuthCounts: ePortalAuthorizationCountReducer,
    eportalAuthData: ePortalAuthorizationDataReducer,
    eportalODData: ePortalOutdoorDutyReducer,
    eportalTBRData: ePortalTicketBookingReducer,
    eportalLRData: ePortalLeavesReducer,
    
    hrmsAuthCounts: hrmsAuthorizationCountReducer,
    hrmsKRAAcivityData: hrmsKRAActivityReducer,
    hrmsquestionMasterData: hrmsQuestionMasterReducer, // <-- key must match the selector exactly
    hrmscapabilitiesData: hrmsCapabilitiesReducer,
    hrmsdeptactivitiesData: hrmsDeptActivitiesReducer,
    hrmspoliciesData: hrmsPoliciesReducer,
    // epp: eppReducer,
    // sfm: sfmReducer,
    // hrms: hrmsReducer,
  },
});