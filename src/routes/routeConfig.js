import Login from "../auth/Login";
import ForgotPassword from "../auth/ForgotPassword";


// Site-Dashboards components
//import HRMSDashboard from  "../portals/hrms/pages/components/Dashboard";
//import SFMDashboard from "../portals/sfm/pages/components/Dashboard";

import Dashboard from "../portals/eportal/components/dashboard/Dashboard";

import ConferenceRoom from "../portals/eportal/components/my-activities/ConferenceRoom";
import ItReturn from '../portals/eportal/components/my-activities/ItReturn/ItReturn';
import DownloadITRDocs from '../portals/eportal/components/my-activities/DownloadITRDocs';

import Policies from "../portals/eportal/components/policies-documents/Policies";
import HolidayCalendar from "../portals/eportal/components/policies-documents/HolidayCalendar";
import MyDocuments from "../portals/eportal/components/policies-documents/MyDocuments";

import CompanyPolicies from "../portals/eportal/components/maintenance/CompanyPolicies";
import ProfileMaintenance from "../portals/eportal/components/maintenance/ProfileMaintenance";
import EmployeeAccess from "../portals/eportal/components/maintenance/EmployeeAccess";

import DailyAttendanceInfo from "../portals/eportal/components/reports/DailyAttendanceInfo";
import ItrDownloadReport from '../portals/eportal/components/reports/ItrDownloadReport';
import PolicyEndorsementReport from "../portals/eportal/components/reports/PolicyEndorsementReport";
import ViewLogs from "../portals/eportal/components/reports/ViewLog";

import PolicyAcceptance from '../pages/PolicyAcceptance';

import OutdoorDuty from "../portals/eportal/components/my-activities/OutdoorDuty";
import OutdoorDutyAuthorization from "../components/authorization/OutdoorDutyAuthorization";
import TicketBookingAuthorization from "../components/authorization/TicketBookingAuthorization";
import TicketBooking from "../portals/eportal/components/my-activities/TicketBooking";
import Leave from "../portals/eportal/components/my-activities/Leaves";
import LeavesAuthorization from "../components/authorization/LeavesAuthorization";
import ConferenceRoomAuthorization from "../components/authorization/ConferenceRooAuthorization";

// Sitewise Protected components
//-------------------ePortal------------------------------------------------
import MyProfile from '../pages/MyProfile';

//-------------------EPP------------------------------------------------
//import EppDashboard from  "../portals/epp/pages/Dashboard";
//import Enquiry from  "../portals/epp/pages/Enquiry";

export const routeConfig = {
  public: [
    { path: "/login", element: Login },
    { path: "/forgot-password", element: ForgotPassword },
  ],

  protected: [
    { path: "eportal/ticket-booking-req", element: TicketBooking },
    { path: "eportal/gatepass", element: OutdoorDuty },
    { path: "eportal/leave", element: Leave },
    { path: "eportal/dashboard", element: Dashboard },
    

    { path: "eportal/my-documents", element: MyDocuments },
    { path: "eportal/company-policies", element: CompanyPolicies },
    { path: "eportal/policies", element: Policies },
    { path: "eportal/holiday-calendar", element: HolidayCalendar },
    { path: "eportal/conference-room", element: ConferenceRoom },
    { path: "eportal/profile-maintenance", element: ProfileMaintenance },
    { path: "eportal/employee-access", element: EmployeeAccess },
    { path: "eportal/my-profile", element: MyProfile },
    { path: "eportal/attendance-info", element: DailyAttendanceInfo },
    { path: "eportal/it-return", element: ItReturn },
    { path: "eportal/download-itr", element: DownloadITRDocs },
    { path: "policy-acceptance", element: PolicyAcceptance },
    { path: "eportal/itr-report", element: ItrDownloadReport },
    { path: "eportal/policy-endorsement-report", element: PolicyEndorsementReport },   
    { path: "eportal/taskauthorization/109", element: LeavesAuthorization },
    { path: "eportal/taskauthorization/346", element: TicketBookingAuthorization },
    { path: "eportal/taskauthorization/349", element: OutdoorDutyAuthorization },
    { path: "eportal/taskauthorization/357", element: ConferenceRoomAuthorization },
    { path: "eportal/view-logs", element: ViewLogs },

    //EPP
   // { path: "epp/dashboard", element: EppDashboard },
   // { path: "epp/enquiry", element: Enquiry }

  ],
};
