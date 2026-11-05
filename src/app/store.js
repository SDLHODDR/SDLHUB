import { configureStore } from "@reduxjs/toolkit";
import ePortalAuthorizationCountReducer from "../portals/eportal/store/ePortalAuthorizationCountSlice";
import ePortalAuthorizationDataReducer from "../portals/eportal/store/ePortalAuthorizationDataSlice";
import hrmsAuthorizationDataReducer from "../portals/hrms/store/hrmsAuthorizationDataSlice";
import ePortalOutdoorDutyReducer from "../portals/eportal/store/ePortalOutdoorDutySlice";
import ePortalTicketBookingReducer from "../portals/eportal/store/ePortalTicketBookingSlice";
import ePortalLeavesReducer from "../portals/eportal/store/ePortalLeavesSlice";
import hrmsKRAActivityReducer from "../portals/hrms/store/hrmsKRAActivitySlice";
import hrmsQuestionMasterReducer from "../portals/hrms/store/hrmsQuestionMasterSlice"; // <-- add this
import hrmsCapabilitiesReducer from "../portals/hrms/store/hrmsCapabilitiesSlice";
import hrmsDeptActivitiesReducer from "../portals/hrms/store/hrmsDeptActivitySlice";
import hrmsPoliciesReducer from "../portals/hrms/store/hrmsPolicySlice";
import hrmsAuthorizationCountReducer from "../portals/hrms/store/hrmsAuthorizationCountSlice";
import notificationReducer from "../shared/store/notificationSlice";
import telegramCountReducer from "../portals/telegram/store/telegramCountSlice";

export const store = configureStore({
  reducer: {
    eportalAuthCounts: ePortalAuthorizationCountReducer,
    eportalAuthData: ePortalAuthorizationDataReducer,
    eportalODData: ePortalOutdoorDutyReducer,
    eportalTBRData: ePortalTicketBookingReducer,
    eportalLRData: ePortalLeavesReducer,
    
    hrmsAuthCounts: hrmsAuthorizationCountReducer,
    notifications: notificationReducer,
    telegramCounts: telegramCountReducer,
    hrmsAuthData: hrmsAuthorizationDataReducer,
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