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
    
    CAPABILITIES_GET: "/hrms/maintainance/capabilities/getCapabilitiesList.php",
    CAPABILITIES_SAVE: "/hrms/maintainance/capabilities/saveCapabilities.php",

    DEPTACTIVITY_DEPTMST_GET: "/hrms/maintainance/deptactivities/getDepartmentMaster.php",
    DEPTACTIVITY_FETCH: "/hrms/maintainance/deptactivities/getDeptActivitiesList.php",
    DEPTACTIVITY_SAVE: "/hrms/maintainance/deptactivities/saveDeptActivities.php",
    DEPTACTIVITY_DELETE: "/hrms/maintainance/deptactivities/deleteDeptActivities.php",
    DEPARTMENT: "/department/getDepartments.php",
        

  },

  DASHBOARD: {
    GET: "/dashboard.php",
  },

  MASTERDATA: {
    GET_MASTER_DATA: "/masterdata/master/getMasterData.php",
    GET_MASTER_TABLES: "/masterdata/master/getMasterTables.php",
    SAVE_MASTER_DATA: "/masterdata/master/saveMasterData.php",
  },

  MAINTAINANCE: {
    GET_PROFILES: "/maintainance/profilemaintenance/getProfiles.php",
    GET_PROFILE_ACCESS: "/maintainance/profilemaintenance/getProfileAccess.php",
    SAVE_PROFILE_ACCESS: "/maintainance/profilemaintenance/saveProfileAccess.php",
  },


};