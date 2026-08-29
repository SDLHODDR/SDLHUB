import { hrmsRequest } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

// =====================================================
// JOB DESCRIPTION
// =====================================================

export const getJobDescriptions = (params = {}) =>
  hrmsRequest({
    url: HRMS_API.MAINTAINANCE.JOB_DESCRIPTION_LIST,
    method: "GET",
    params,
  });

export const getJobDescriptionById = (id) =>
  hrmsRequest({
    url: HRMS_API.MAINTAINANCE.JOB_DESCRIPTION_LIST,
    method: "GET",
    params: { id },
  });

export const saveJobDescription = (payload = {}) =>
  hrmsRequest({
    url: HRMS_API.MAINTAINANCE.JOB_DESCRIPTION_SAVE,
    method: "POST",
    data: payload,
  });


// =====================================================
// JOB DESCRIPTION MASTER DATA
// =====================================================

const getJDMaster = (type) =>
  hrmsRequest({
    url: "/maintainance/jobdescription/getJobDescriptionMasters.php",
    method: "GET",
    params: { type },
  });

export const getKRAList = () =>
  getJDMaster("kra");

export const getQualificationList = () =>
  getJDMaster("qualification");

export const getEducationLevelList = () =>
  getJDMaster("education_level");

export const getSkillList = () =>
  getJDMaster("skill");

export const getExpertiseLevelList = () =>
  getJDMaster("expertise");

export const getAllowanceList = () =>
  getJDMaster("allowance");

export const getExpenseTypeList = () =>
  getJDMaster("expense_type");

export const getFrequencyList = () =>
  getJDMaster("frequency");

export const getCTCHeadList = () =>
  getJDMaster("ctc_head");

// export const getFormulaList = () =>
//   getJDMaster("formula");

export const getQuestionTemplateList = () =>
  getJDMaster("question_template");

export const getQuestionGroupList = () =>
  getJDMaster("question_group");

export const getDivisionList = () =>
  getJDMaster("division");

export const getInductionList = () =>
  getJDMaster("induction");

export const getOrganogramList = () =>
  getJDMaster("organogram");