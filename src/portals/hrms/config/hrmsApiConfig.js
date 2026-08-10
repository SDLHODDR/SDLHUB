export const HRMS_API = {
  MENU: {
    GET_MENU: "/menu/getMenu.php",
  },

  MAINTAINANCE: {
    CAPABILITIES_GET: "/maintainance/capabilities/getCapabilitiesList.php",
    CAPABILITIES_SAVE: "/maintainance/capabilities/saveCapabilities.php",
    DEPTACTIVITY_DEPTMST_GET: "/maintainance/deptactivities/getDepartmentMaster.php",
    DEPTACTIVITY_FETCH: "/maintainance/deptactivities/getDeptActivitiesList.php",
    DEPTACTIVITY_SAVE: "/maintainance/deptactivities/saveDeptActivities.php",
    DEPTACTIVITY_DELETE: "/maintainance/deptactivities/deleteDeptActivities.php",
    POLICY_GET: "/maintainance/policylist/getPoliciesList.php",
    COMPANY_MASTER_GET: "/maintainance/policylist/getCompanyMaster.php",
    DEPARTMENT_MASTER_GET: "/maintainance/policylist/getDepartmentMaster.php",
    DIVISION_MASTER_GET: "/maintainance/policylist/getDivisionMaster.php",
    POLICY_SAVE: "/maintainance/policylist/savePolicies.php",
    POLICY_PUBLISH: "/maintainance/policylist/getPolicyPublish.php",    
    KRAACTIVITY_GET: "/maintainance/kraactivity/getKRAActivityList.php",
    KRAMASTER: "/maintainance/kraactivity/getKRAMaster.php",
    KRAACTIVITY_SAVE: "/maintainance/kraactivity/saveKRAActivity.php",
    KRAACTIVITY_DELETE: "/maintainance/kraactivity/deleteKRAActivity.php",
    QUESTION_GET: "/maintainance/question/getQuestionList.php",
    QUESTION_SAVE: "/maintainance/question/saveQuestion.php",
    QUESTION_DELETE: "/maintainance/question/deleteQuestion.php",
    QUESTION_GROUPS: "/maintainance/question/getQuestionGroups.php",
    QUESTION_SUBGROUPS: "/maintainance/question/getQuestionSubGroups.php",
    DEPARTMENT: "/department/getDepartments.php",
    GET_PROFILES: "/maintainance/profilemaintenance/getProfiles.php",
    GET_PROFILE_ACCESS: "/maintainance/profilemaintenance/getProfileAccess.php",
    SAVE_PROFILE_ACCESS: "/maintainance/profilemaintenance/saveProfileAccess.php",      
  },

  DASHBOARD: {
    GET: "/dashboard.php",
  },

  MASTERDATA: {
    GET_MASTER_DATA: "/masterdata/master/getMasterData.php",
    GET_MASTER_TABLES: "/masterdata/master/getMasterTables.php",
    SAVE_MASTER_DATA: "/masterdata/master/saveMasterData.php",
  },
};