import HRMSDashboard from "../portals/hrms/components/dashboard/Dashboard";
import KRAActivity from "../portals/hrms/pages/maintainance/KRAActivity"
import QuestionMaster from "../portals/hrms/pages/maintainance/QuestionMaster";
import Capabilities from "../portals/hrms/pages/maintainance/Capabilities";
import MasterData from "../portals/hrms/pages/master-data/MasterData";
import DivisionDocMapping from "../portals/hrms/pages/master-data/DivisionDocumentMapping";

import DepartmentActivity from "../portals/hrms/pages/maintainance/DepartmentActivity";
import Department from "../portals/hrms/pages/maintainance/department";
import ProfileMaintenance from "../portals/hrms/pages/maintainance/ProfileMaintenance";
import DepartmentDesignationMap from "../portals/hrms/pages/maintainance/DepartmentDesignationMap";
import JobDescription from "../portals/hrms/pages/maintainance/JobDescription";
import PolicyList from "../portals/hrms/pages/maintainance/PolicyList";
import Organogram from "../portals/hrms/pages/master-data/Organogram";
import OrganogramV3 from "../portals/hrms/pages/master-data/OrganogramV3";
import EmployeeAccess from "../portals/hrms/pages/maintainance/EmployeeAccess";

import JoiningAuthorization from "../components/authorization/JoiningAuthorization";
import ExitAuthorization from "../components/authorization/ExitAuthorization";
import ViewLogs from "../portals/hrms/pages/reports/ViewLog";

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
  { path: "hrms/maintainance/capabilities", element: Capabilities },
  { path: "hrms/maintainance/department-activity", element: DepartmentActivity },
  { path: "hrms/maintainance/policylist", element: PolicyList },

  { path: "hrms/maintainance/employee-access", element: EmployeeAccess },

  // Authorization
	{path: "hrms/taskauthorization/J/:tid", element: JoiningAuthorization,},
	{path: "hrms/taskauthorization/E/:tid", element: ExitAuthorization,},
	//{path: "hrms/taskauthorization/R/:tid", element: RecruitmentAuthorization,},
	// {path: "hrms/taskauthorization/357", element: OthersAuthorization,},
  //{path: "hrms/taskauthorization/T/:tid", element: TenureChangeAuthorization,},
	//{path: "hrms/taskauthorization/A/:tid", element: AppraisalAuthorization,},
	// {path: "hrms/taskauthorization/349", element: EmployeeTransferAuthorization,},
  { path: "hrms/reports/view-logs", element: ViewLogs },
];
