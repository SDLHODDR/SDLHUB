import HRMSDashboard from "../portals/hrms/components/dashboard/Dashboard";
import KRAActivity from "../portals/hrms/pages/maintainance/KRAActivity"
import QuestionMaster from "../portals/hrms/pages/maintainance/QuestionMaster";
import Capabilities from "../portals/hrms/pages/maintainance/Capabilities";
import MasterData from "../portals/hrms/pages/master-data/MasterData";
import DepartmentActivity from "../portals/hrms/pages/maintainance/DepartmentActivity";
import Department from "../portals/hrms/pages/maintainance/department";
import ProfileMaintenance from "../portals/hrms/pages/maintainance/ProfileMaintenance";
import PolicyList from "../portals/hrms/pages/maintainance/PolicyList";

export const hrmsRoutes = [
  { path: "hrms/dashboard", element: HRMSDashboard,},
  { path: "hrms/masterdata/mastermaster", element: MasterData, },

  { path: "hrms/maintainance/profilemaintenance", element: ProfileMaintenance, },
  { path: "hrms/maintainance/kra-activity", element: KRAActivity },
  { path: "hrms/maintainance/questionmaster", element: QuestionMaster },
  { path: "hrms/maintainance/capabilities", element: Capabilities },
  { path: "hrms/maintainance/department-activity", element: DepartmentActivity },
  { path: "hrms/maintainance/policylist", element: PolicyList },
  { path: "hrms/maintainance/department", element: Department },

];
