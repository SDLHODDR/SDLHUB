export const HRMS_API = {
  MENU: {
    GET_MENU: "/menu/getMenu.php",
  },

  MAINTAINANCE: {
    CAPABILITIES_GET: "/maintainance/capabilities/getCapabilitiesList.php",
    CAPABILITIES_SAVE: "/maintainance/capabilities/saveCapabilities.php",
    CAPABILITIES_MASTER_SAVE: "/maintainance/capabilities/saveCapabilitiesMaster.php",
    DEPTACTIVITY_DEPTMST_GET: "/maintainance/deptactivities/getDepartmentMaster.php",
    DEPTACTIVITY_FETCH: "/maintainance/deptactivities/getDeptActivitiesList.php",
    DEPTACTIVITY_SAVE: "/maintainance/deptactivities/saveDeptActivities.php",
    DEPARTMENTMASTER_SAVE: "/maintainance/deptactivities/saveDeptMaster.php",
    DEPTACTIVITY_DELETE: "/maintainance/deptactivities/deleteDeptActivities.php",
    POLICY_GET: "/maintainance/policylist/getPoliciesList.php",
    COMPANY_MASTER_GET: "/maintainance/policylist/getCompanyMaster.php",
    DEPARTMENT_MASTER_GET: "/maintainance/policylist/getDepartmentMaster.php",
    DIVISION_MASTER_GET: "/maintainance/policylist/getDivisionMaster.php",
    POLICY_SAVE: "/maintainance/policylist/savePolicies.php",
    POLICY_ASSOCIATIONS: "/maintainance/policylist/getPolicyAssociations.php",
    POLICY_PUBLISH: "/maintainance/policylist/getPolicyPublish.php",
    KRAACTIVITY_GET: "/maintainance/kraactivity/getKRAActivityList.php",
    KRAMASTER: "/maintainance/kraactivity/getKRAMaster.php",
    KRAACTIVITY_SAVE: "/maintainance/kraactivity/saveKRAActivity.php",
    KRAMASTER_SAVE: "/maintainance/kraactivity/saveKRAMaster.php",
    KRAACTIVITY_DELETE: "/maintainance/kraactivity/deleteKRAActivity.php",
    QUESTION_GET: "/maintainance/question/getQuestionList.php",
    QUESTION_SAVE: "/maintainance/question/saveQuestion.php",
    QUESTION_DELETE: "/maintainance/question/deleteQuestion.php",
    QUESTION_GROUPS: "/maintainance/question/getQuestionGroups.php",
    QUESTION_SUBGROUPS: "/maintainance/question/getQuestionSubGroups.php",
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

    GET_EMPLOYEES: "/maintainance/employeeaccess/getEmployees.php",
    GET_EMPLOYEE_ACCESS: "/maintainance/employeeaccess/getEmployeeAccess.php",
    SAVE_EMPLOYEE_ACCESS: "/maintainance/employeeaccess/saveEmployeeAccess.php",
    DISABLE_EMPLOYEE_ACCESS: "/maintainance/employeeaccess/disableEmployeeAccess.php",
  },

  DASHBOARD: {
    GET: "/dashboard.php",
  },

  MASTERDATA: {
    GET_MASTER_DATA: "/masterdata/master/getMasterData.php",
    GET_MASTER_TABLES: "/masterdata/master/getMasterTables.php",
    SAVE_MASTER_DATA: "/masterdata/master/saveMasterData.php",

    GET_ORGANOGRAM_DATA: "/masterdata/orgonogram/getOrgonogramData.php",
    GET_HRMS_CONFIGS: "/masterdata/orgonogram/getHRMSConfigData.php",

    GET_DIVISION_DOC_MAPPING_DATA: "/masterdata/divisiondocmapping/getDivisionDocumentMapping.php",
    SAVE_DIVISION_DOC_MAPPING: "/masterdata/divisiondocmapping/saveDivisionDocumentMapping.php",
    
    GET_FIN_ENTITY: "/masterdata/orgonogram/getHRMSFinEntityData.php",
    GET_DESIGNATION: "/masterdata/orgonogram/getHRMSDesignationData.php",
    GET_COMPANY: "/masterdata/orgonogram/getHRMSCompanyData.php",
    GET_DEPARTMENT: "/masterdata/orgonogram/getHRMSDepartmentData.php",
    GET_JD_LABEL: "/masterdata/orgonogram/getHRMSJDLabelData.php",
    GET_DIVISION: "/masterdata/orgonogram/getHRMSDivisionData.php",
    GET_EMPLOYEE_LEVEL: "/masterdata/orgonogram/getHRMSEmployeeLevelData.php",
    GET_ORGANOGRAM_LEVEL: "/masterdata/orgonogram/getHRMSOrgonogramLevelData.php",
    GET_ORGANOGRAM_DETAILS: "/masterdata/orgonogram/getHRMSOrgonogramDetailsData.php",
    SAVE_ORGANOGRAM: "/masterdata/orgonogram/saveOrganogramData.php",
  },
};