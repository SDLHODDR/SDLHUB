import HRMSDashboard from "./components/dashboard/Dashboard";
import KRAActivity from "./pages/maintainance/KRAActivity"
import QuestionMaster from "./pages/maintainance/QuestionMaster";
import Capabilities from "./pages/maintainance/Capabilities";
import MasterData from "./pages/master-data/MasterData";
import DivisionDocMapping from "./pages/master-data/DivisionDocumentMapping";

import DepartmentActivity from "./pages/maintainance/DepartmentActivity";
import Department from "./pages/maintainance/department";
import ProfileMaintenance from "./pages/maintainance/ProfileMaintenance";
import DepartmentDesignationMap from "./pages/maintainance/DepartmentDesignationMap";
import JobDescription from "./pages/maintainance/JobDescription";
import PolicyList from "./pages/maintainance/PolicyList";
import Organogram from "./pages/master-data/Organogram";
import OrganogramV3 from "./pages/master-data/OrganogramV3";
import EmployeeAccess from "./pages/maintainance/EmployeeAccess";
import EmployeeData from "./pages/maintainance/EmployeeData";
import TenureChange from "./pages/tenure/TenureChange";
import TenureChangeAssessment from "./pages/tenure/TenureChangeAssessment";
import TenureChangeCtc from "./pages/tenure/TenureChangeCtc";
import TenureChangeLetter from "./pages/tenure/TenureChangeLetter";

import JoiningAuthorization from "./authorization/joining/JoiningAuthorization";
import ExitAuthorization from "./authorization/exit/ExitAuthorization";
import MastersAuthorization from "./authorization/masters/MastersAuthorization";
import TenureChangeAuthorization from "./authorization/tenure/TenureChangeAuthorization";
import RecruitmentAuthorization from "./authorization/recruitment/RecruitmentAuthorization";
import ViewLogs from "./pages/reports/ViewLog";
import SeparationRequest from "./pages/separation/SeparationRequest";
import NewEmployee from "./pages/joining/NewEmployee";
import CandidateList from "./pages/recruitment/CandidateList";
import CandidateApplicationForm from "./pages/recruitment/CandidateApplicationForm";
import RecruitmentRequest from "./pages/recruitment/RecruitmentRequest";
import PendingRecruitment from "./pages/recruitment/PendingRecruitment";
import NewJoinee from "./pages/joining/NewJoinee";
import RehireEmployee from "./pages/joining/RehireEmployee";
//import TenureChange from "../portals/hrms/pages/reports/TenureChange";
// // import DepartmentTable from "../portals/hrms/components/DepartmentTable";
// // import Department from "../portals/hrms/components/Department";

export const hrmsRoutes = [
  { path: "hrms/dashboard", element: HRMSDashboard,},
  { path: "hrms/masterdata/mastermaster", element: MasterData, },
  { path: "hrms/masterdata/organogram", element: Organogram, },
  { path: "hrms/masterdata/division-doc-mapping", element: DivisionDocMapping, },
  { path: "hrms/masterdata/organogram-v3", element: OrganogramV3, },

  { path: "hrms/maintainance/profilemaintenance", element: ProfileMaintenance, },
  { path: "hrms/maintainance/kra-activity", element: KRAActivity },
  { path: "hrms/maintainance/questionmaster", element: QuestionMaster },
  
  { path: "hrms/maintainance/department", element: Department },
  { path: "hrms/maintainance/department-designation", element: DepartmentDesignationMap },
  { path: "hrms/masterdata/jobdescription", element: JobDescription },
  // New Employee (Manual): HR_MENU_SUB PROG_URL "masterdata/employee"
  { path: "hrms/masterdata/employee", element: NewEmployee },
  // HR_MENU_SUB PROG_URL "joining/new_joinee" and "joining/rehire_employee"
  { path: "hrms/joining/new-joinee", element: NewJoinee },
  { path: "hrms/joining/rehire-employee", element: RehireEmployee },
  { path: "hrms/maintainance/capabilities", element: Capabilities },
  { path: "hrms/maintainance/department-activity", element: DepartmentActivity },
  { path: "hrms/maintainance/policylist", element: PolicyList },
  { path: "hrms/maintainance/employee-data", element: EmployeeData },
  { path: "hrms/maintainance/tenure-change", element: TenureChange },
  { path: "hrms/maintainance/tenure-change/assessment", element: TenureChangeAssessment },
  { path: "hrms/maintainance/tenure-change/ctc", element: TenureChangeCtc },
  { path: "hrms/maintainance/tenure-change/letter", element: TenureChangeLetter },

  { path: "hrms/maintainance/employee-access", element: EmployeeAccess },

  // Separation (menu PROG_URL "separation")
  { path: "hrms/separation", element: SeparationRequest },

  // Recruitment: HR_MENU_SUB.PROG_URL with "_" as "-", as the menu links them (cleanRoutePath).
  // "recuritment" is how the menu table spells it.
  { path: "hrms/recruitment/candidate-info-list", element: CandidateList },
  { path: "hrms/recruitment/candidate-info-list/form/:id", element: CandidateApplicationForm },
  { path: "hrms/recruitment/recruitment-req", element: RecruitmentRequest },
  { path: "hrms/recruitment/pending-recuritment", element: PendingRecruitment },

  // Authorization
	{path: "hrms/taskauthorization/J/:tid", element: JoiningAuthorization,},
	{path: "hrms/taskauthorization/E/:tid", element: ExitAuthorization,},
	{path: "hrms/taskauthorization/R/:tid", element: RecruitmentAuthorization,},
	// {path: "hrms/taskauthorization/357", element: OthersAuthorization,},
  {path: "hrms/taskauthorization/T/:tid", element: TenureChangeAuthorization,},
	//{path: "hrms/taskauthorization/A/:tid", element: AppraisalAuthorization,},
	// {path: "hrms/taskauthorization/349", element: EmployeeTransferAuthorization,},
  { path: "hrms/reports/view-logs", element: ViewLogs },
  // { path: "hrms/reports/tenure-change", element: TenureChange },
  {path: "hrms/taskauthorization/M/:tid", element: MastersAuthorization,},

  // { path: "hrms/maintainance/department", element: Department }

];
