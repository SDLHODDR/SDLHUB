/*
 * HR_MENU_SUB.PROG_URL is shared with the old HRMS, so it holds the old page
 * names (e.g. "new_joinee.php"). This maps each old page to its SDL Hub route.
 * Menu entries already holding an SDL Hub path (e.g. "joining/new_joinee")
 * keep working through the generic conversion in HorizontalMenu.
 * Keys are lower case; reports keep their "?reptnm=" part.
 */
export const LEGACY_MENU_ROUTES = {
  // Master Data
  "jd_edit.php": "/hrms/masterdata/jobdescription",
  "employee_edit2.php": "/hrms/masterdata/employee",
  "org_edit.php": "/hrms/masterdata/organogram",
  "org_edit3.php": "/hrms/masterdata/organogram-v3",
  "employee_edit.php": "/hrms/maintainance/employee-data",
  "mst_tables_edit.php": "/hrms/masterdata/mastermaster",

  // Maintenance
  "department_edit.php": "/hrms/maintainance/department",
  "designation_map.php": "/hrms/maintainance/department-designation",
  "policy_edit.php": "/hrms/maintainance/policylist",
  "kra_activity_edit.php": "/hrms/maintainance/kra-activity",
  "questions_edit.php": "/hrms/maintainance/questionmaster",
  "department_act.php": "/hrms/maintainance/department-activity",
  "profile_edit.php": "/hrms/maintainance/profilemaintenance",
  "capabilities_edit.php": "/hrms/maintainance/capabilities",
  "emp_access.php": "/hrms/maintainance/employee-access",
  "divisnmap_edit.php": "/hrms/masterdata/division-doc-mapping",

  // Recruitment
  "candidate_info_list.php": "/hrms/recruitment/candidate-info-list",
  "recruitment_req.php": "/hrms/recruitment/recruitment-req",
  "pending_recruitments.php": "/hrms/recruitment/pending-recuritment",

  // Joining
  "new_joinee.php": "/hrms/joining/new-joinee",
  "rehire_emp.php": "/hrms/joining/rehire-employee",

  // Separation
  "separation_edit.php": "/hrms/separation",

  // Reports
  "rept_admin.php?reptnm=tenure": "/hrms/maintainance/tenure-change",
};

/** SDL Hub route of an old page name, or null when the page has not been moved. */
export const legacyMenuRoute = (progUrl) => {
  if (!progUrl || typeof progUrl !== "string") return null;
  const key = progUrl.trim().replace(/^\/+/, "").toLowerCase();
  return LEGACY_MENU_ROUTES[key] ?? null;
};
