import Dashboard from "./components/dashboard/Dashboard";

import ConferenceRoom from "./components/my-activities/ConferenceRoom";
import ItReturn from "./components/my-activities/ItReturn/ItReturn";
import DownloadITRDocs from "./components/my-activities/DownloadITRDocs";
import OutdoorDuty from "./components/my-activities/OutdoorDuty";
import TicketBooking from "./components/my-activities/TicketBooking";
import Leave from "./components/my-activities/Leaves";

import Policies from "./components/policies-documents/Policies";
import HolidayCalendar from "./components/policies-documents/HolidayCalendar";
import MyDocuments from "./components/policies-documents/MyDocuments";

import CompanyPolicies from "./components/maintenance/CompanyPolicies";
import ProfileMaintenance from "./components/maintenance/ProfileMaintenance";
import EmployeeAccess from "./components/maintenance/EmployeeAccess";

import DailyAttendanceInfo from "./components/reports/DailyAttendanceInfo";
import ItrDownloadReport from "./components/reports/ItrDownloadReport";
import PolicyEndorsementReport from "./components/reports/PolicyEndorsementReport";
import ViewLogs from "./components/reports/ViewLog";

import OutdoorDutyAuthorization from "./authorization/OutdoorDutyAuthorization";
import TicketBookingAuthorization from "./authorization/TicketBookingAuthorization";
import LeavesAuthorization from "./authorization/LeavesAuthorization";
import ConferenceRoomAuthorization from "./authorization/ConferenceRooAuthorization";

import ConferenceRoomMaintenance from "./components/maintenance/ConferenceRoomMaintenance";

import MyProfile from "../../shared/pages/profile/profile"; 
//import Profile from "../../shared/pages/profile/profile"; //"../pages/MyProfile";

export const eportalRoutes = [
	{ path: "eportal/dashboard", element: Dashboard, },

	// My Activities
	{ path: "eportal/ticket-booking-req", element: TicketBooking, },
	{ path: "eportal/gatepass", element: OutdoorDuty, },
	{ path: "eportal/leave", element: Leave, },
	{ path: "eportal/conference-room", element: ConferenceRoom, },
	{ path: "eportal/it-return", element: ItReturn, },
	{ path: "eportal/download-itr", element: DownloadITRDocs, },

	// Policies & Documents
	{ path: "eportal/my-documents", element: MyDocuments, },
	{ path: "eportal/policies", element: Policies, },
	{ path: "eportal/holiday-calendar", element: HolidayCalendar, },

	// Maintenance
	{ path: "eportal/profile-maintenance", element: ProfileMaintenance, },
	{ path: "eportal/company-policies", element: CompanyPolicies, },
	{ path: "eportal/employee-access", element: EmployeeAccess, },
	{ path: "eportal/conference-room-maintenance", element: ConferenceRoomMaintenance, },

	// Reports
	{ path: "eportal/attendance-info", element: DailyAttendanceInfo, },
	{ path: "eportal/itr-report", element: ItrDownloadReport, },
	{ path: "eportal/policy-endorsement-report", element: PolicyEndorsementReport, },
	{ path: "eportal/view-logs", element: ViewLogs, },

	// Profile
	{ path: "eportal/my-profile", element: MyProfile, },
	//{ path: "eportal/profile", element: Profile, },

	// Authorization
	{ path: "eportal/taskauthorization/109", element: LeavesAuthorization, },
	{ path: "eportal/taskauthorization/346", element: TicketBookingAuthorization, },
	{ path: "eportal/taskauthorization/349", element: OutdoorDutyAuthorization, },
	{ path: "eportal/taskauthorization/21", element: OutdoorDutyAuthorization, },
	{ path: "eportal/taskauthorization/22", element: OutdoorDutyAuthorization, },
	{ path: "eportal/taskauthorization/357", element: ConferenceRoomAuthorization, },
];
