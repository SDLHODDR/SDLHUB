import Dashboard from "../portals/eportal/components/dashboard/Dashboard";

import ConferenceRoom from "../portals/eportal/components/my-activities/ConferenceRoom";
import ItReturn from "../portals/eportal/components/my-activities/ItReturn/ItReturn";
import DownloadITRDocs from "../portals/eportal/components/my-activities/DownloadITRDocs";
import OutdoorDuty from "../portals/eportal/components/my-activities/OutdoorDuty";
import TicketBooking from "../portals/eportal/components/my-activities/TicketBooking";
import Leave from "../portals/eportal/components/my-activities/Leaves";

import Policies from "../portals/eportal/components/policies-documents/Policies";
import HolidayCalendar from "../portals/eportal/components/policies-documents/HolidayCalendar";
import MyDocuments from "../portals/eportal/components/policies-documents/MyDocuments";

import CompanyPolicies from "../portals/eportal/components/maintenance/CompanyPolicies";
import ProfileMaintenance from "../portals/eportal/components/maintenance/ProfileMaintenance";
import EmployeeAccess from "../portals/eportal/components/maintenance/EmployeeAccess";

import DailyAttendanceInfo from "../portals/eportal/components/reports/DailyAttendanceInfo";
import ItrDownloadReport from "../portals/eportal/components/reports/ItrDownloadReport";
import PolicyEndorsementReport from "../portals/eportal/components/reports/PolicyEndorsementReport";
import ViewLogs from "../portals/eportal/components/reports/ViewLog";

import OutdoorDutyAuthorization from "../components/authorization/OutdoorDutyAuthorization";
import TicketBookingAuthorization from "../components/authorization/TicketBookingAuthorization";
import LeavesAuthorization from "../components/authorization/LeavesAuthorization";
import ConferenceRoomAuthorization from "../components/authorization/ConferenceRooAuthorization";

import MyProfile from "../pages/MyProfile";

export const eportalRoutes = [
  {path: "eportal/dashboard",  element: Dashboard,},

  // My Activities
	{path: "eportal/ticket-booking-req",  element: TicketBooking,},
	{path: "eportal/gatepass",  element: OutdoorDuty,},
	{path: "eportal/leave",    element: Leave,},
	{path: "eportal/conference-room",    element: ConferenceRoom,},
	{path: "eportal/it-return",    element: ItReturn,},
	{path: "eportal/download-itr",    element: DownloadITRDocs,},

  // Policies & Documents
	{path: "eportal/my-documents", element: MyDocuments,},
	{path: "eportal/company-policies", element: CompanyPolicies,},
	{path: "eportal/policies", element: Policies,},
	{path: "eportal/holiday-calendar", element: HolidayCalendar,},

  // Maintenance
	{path: "eportal/profile-maintenance", element: ProfileMaintenance,},
	{path: "eportal/employee-access", element: EmployeeAccess,},

  // Reports
	{path: "eportal/attendance-info", element: DailyAttendanceInfo,},
	{path: "eportal/itr-report", element: ItrDownloadReport,},
	{path: "eportal/policy-endorsement-report", element: PolicyEndorsementReport,},
	{path: "eportal/view-logs", element: ViewLogs,},

  // Profile
	{path: "eportal/my-profile",    element: MyProfile,},

  // Authorization
	{path: "eportal/taskauthorization/109", element: LeavesAuthorization,},
	{path: "eportal/taskauthorization/346", element: TicketBookingAuthorization,},
	{path: "eportal/taskauthorization/349", element: OutdoorDutyAuthorization,},
	{path: "eportal/taskauthorization/357", element: ConferenceRoomAuthorization,},
];
