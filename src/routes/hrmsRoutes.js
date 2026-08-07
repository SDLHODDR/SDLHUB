import HRMSDashboard from "../portals/hrms/components/dashboard/Dashboard";
import KRAActivity from "../portals/hrms/pages/maintainance/KRAActivity"
import QuestionMaster from "../portals/hrms/pages/maintainance/QuestionMaster";
import Capabilities from "../portals/hrms/pages/maintainance/Capabilities";
import MasterData from "../portals/hrms/pages/master-data/MasterData";
import DepartmentActivity from "../portals/hrms/pages/maintainance/DepartmentActivity";

export const hrmsRoutes = [
  {path: "hrms/dashboard", element: HRMSDashboard,},
  { path: "hrms/masterdata/mastermaster", element: MasterData, },

  { path: "hrms/maintainance/kra-activity", element: KRAActivity },
  { path: "hrms/maintainance/questionmaster", element: QuestionMaster },
  { path: "hrms/maintainance/capabilities", element: Capabilities },
  { path: "hrms/maintainance/department-activity", element: DepartmentActivity },
  
];
