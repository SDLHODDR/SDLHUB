import HRMSDashboard from "../portals/hrms/components/dashboard/Dashboard";
import KRAActivity from "../portals/hrms/pages/maintainance/KRAActivity"

export const hrmsRoutes = [
  {path: "hrms/dashboard", element: HRMSDashboard,},
  

   // Master Data
  // {
  //   path: "hrms/job-description",
  //   element: JobDescription,
  // },

  // Maintenance
  // {
  //   path: "hrms/department",
  //   element: Department,
  // },
  { path: "hrms/maintainance/kra-activity", element: KRAActivity },

  // Recruitment
  // {
  //   path: "hrms/candidate-list",
  //   element: CandidateList,
  // },

];
