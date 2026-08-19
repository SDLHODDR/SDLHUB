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
import EmployeeAccess from "../portals/hrms/pages/maintainance/EmployeeAccess";

export const hrmsRoutes = [
  { path: "hrms/dashboard", element: HRMSDashboard,},
  { path: "hrms/masterdata/mastermaster", element: MasterData, },
  { path: "hrms/masterdata/organogram", element: Organogram, },
  { path: "hrms/masterdata/division-doc-mapping", element: DivisionDocMapping, },

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

];
