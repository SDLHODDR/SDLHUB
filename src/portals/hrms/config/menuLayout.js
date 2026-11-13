/*
 * SDL Hub's own grouping and order of HRMS sub-menus. HR_MENU_SUB is shared with the old
 * HRMS, whose grouping differs (it keeps Department, Policy List, etc. under Maintenance and
 * the employee pages under Master Data), so the menu from the database is rearranged here.
 * Pages are matched by HR_MENU_SUB.PROG_URL (lower case). A listed page the user's profile
 * does not have is skipped; pages not listed keep their database place after the listed ones.
 * The menu labels are those of HR_MENU ("Master Data", "Maintenance").
 */
export const MENU_LAYOUT = {
  "Master Data": [
    "jd_edit.php", // Job Description
    "org_edit.php", // Organogram
    "department_edit.php", // Department
    "organogram_visual.php", // Organogram Visual
    "designation_map.php", // Department - Designation Map
    "mst_tables_edit.php", // Masters Master
    "org_edit3.php", // Organogram V3
    "policy_edit.php", // Policy List
    "kra_activity_edit.php", // KRA Activity
    "questions_edit.php", // Question Master
    "department_act.php", // Department Activity
    "capabilities_edit.php", // Capabilities
    "divisnmap_edit.php", // Division Doc Mapping
  ],
  Maintenance: [
    "employee_edit2.php", // New Employee (Manual)
    "employee_edit.php", // Employee Data
    "profile_edit.php", // Profile Maintenance
    "emp_access.php", // Employee Access
  ],
};

const pageOf = (child) => String(child.url || child.route || child.path || "").trim().replace(/^\/+/, "").toLowerCase();

/** Menus with their children regrouped and ordered by MENU_LAYOUT. */
export const arrangeMenus = (menus) => {
  // A page moves only to a menu this user has; otherwise it stays where the database puts it.
  const labels = new Set(menus.map((menu) => menu.label));
  const home = {};
  Object.entries(MENU_LAYOUT).forEach(([label, pages]) => {
    if (labels.has(label)) pages.forEach((page) => (home[page] = label));
  });

  // Every child that has a home in the layout, from any menu.
  const placed = {};
  menus.forEach((menu) =>
    (menu.children || []).forEach((child) => {
      const page = pageOf(child);
      if (home[page]) placed[page] = child;
    })
  );

  return menus.map((menu) => {
    const layout = MENU_LAYOUT[menu.label];
    const others = (menu.children || []).filter((child) => !home[pageOf(child)]);
    if (!layout) return { ...menu, children: others };
    const listed = layout.map((page) => placed[page]).filter(Boolean);
    return { ...menu, children: [...listed, ...others] };
  });
};
