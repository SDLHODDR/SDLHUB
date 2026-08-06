import HRMSDashboard from "../portals/hrms/components/dashboard/Dashboard";
import MasterData from "../portals/hrms/pages/master-data/MasterData";
import ProfileMaintenance from "../portals/hrms/pages/maintainance/ProfileMaintenance";

export const hrmsRoutes = [
  { path: "hrms/dashboard", element: HRMSDashboard, },
  { path: "hrms/masterdata/mastermaster", element: MasterData, },
  { path: "hrms/maintainance/profilemaintenance", element: ProfileMaintenance, },

];
