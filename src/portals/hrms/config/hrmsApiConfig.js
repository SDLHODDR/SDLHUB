export const HRMS_API = {
  MENU: {
    GET_MENU: "/menu/getMenu.php",
  },

  MAINTAINANCE: {
    KRAACTIVITY_GET: "/hrms/maintainance/kraactivity/getKRAActivityList.php",
    KRAMASTER: "/hrms/maintainance/kraactivity/getKRAMaster.php",
    KRAACTIVITY_SAVE: "/hrms/maintainance/kraactivity/saveKRAActivity.php",
    KRAACTIVITY_DELETE: "/hrms/maintainance/kraactivity/deleteKRAActivity.php",
    QUESTION_GET: "/hrms/maintainance/question/getQuestionList.php",
    QUESTION_SAVE: "/hrms/maintainance/question/saveQuestion.php",
    QUESTION_DELETE: "/hrms/maintainance/question/deleteQuestion.php",
    QUESTION_GROUPS: "/hrms/maintainance/question/getQuestionGroups.php",
    QUESTION_SUBGROUPS: "/hrms/maintainance/question/getQuestionSubGroups.php",

    DEPARTMENT: "/department/getDepartments.php",
    DEPT_DESIGNATION_GET: "/department/getDesignationMap.php",
    DEPT_DESIGNATION_SAVE: "/department/saveDesignationMap.php",
    DEPT_DESIGNATION_DELETE: "/department/deleteDesignationMap.php",
    DESIGNATIONS_MASTER: "/department/getDesignations.php",

    JOB_DESCRIPTION_LIST: "/maintainance/jobdescription/getJobDescriptions.php",
    JOB_DESCRIPTION_SAVE: "/maintainance/jobdescription/saveJobDescription.php",

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