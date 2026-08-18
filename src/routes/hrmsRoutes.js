import HRMSDashboard from "../portals/hrms/components/dashboard/Dashboard";
import KRAActivity from "../portals/hrms/pages/maintainance/KRAActivity"
import QuestionMaster from "../portals/hrms/pages/maintainance/QuestionMaster";
import MasterData from "../portals/hrms/pages/master-data/MasterData";
import Department from "../portals/hrms/pages/maintainance/department";
import ProfileMaintenance from "../portals/hrms/pages/maintainance/ProfileMaintenance";
import DepartmentDesignationMap from "../portals/hrms/pages/maintainance/DepartmentDesignationMap";
import JobDescription from "../portals/hrms/pages/maintainance/JobDescription";

export const hrmsRoutes = [
  {path: "hrms/dashboard", element: HRMSDashboard,},
  { path: "hrms/masterdata/mastermaster", element: MasterData, },
  { path: "hrms/maintainance/profilemaintenance", element: ProfileMaintenance, },

  { path: "hrms/maintainance/kra-activity", element: KRAActivity },
  { path: "hrms/maintainance/questionmaster", element: QuestionMaster },
  
    { path: "hrms/maintainance/department", element: Department },
    { path: "hrms/maintainance/departmentdesignation", element: DepartmentDesignationMap },
    { path: "hrms/maintainance/jobdescription", element: JobDescription },

];
