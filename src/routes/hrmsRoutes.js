import HRMSDashboard from "../portals/hrms/components/dashboard/Dashboard";
import KRAActivity from "../portals/hrms/pages/maintainance/KRAActivity"
import QuestionMaster from "../portals/hrms/pages/maintainance/QuestionMaster";

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
  { path: "hrms/maintainance/questionmaster", element: QuestionMaster },

  // Recruitment
  // {
  //   path: "hrms/candidate-list",
  //   element: CandidateList,
  // },

];
