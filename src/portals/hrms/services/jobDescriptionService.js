// import { hrmsRequest } from "../../../services/request";
// import { HRMS_API } from "../config/hrmsApiConfig";

// export const getJobDescriptions = (params = {}) =>
//   hrmsRequest({
//     url: HRMS_API.MAINTAINANCE.JOB_DESCRIPTION_LIST,
//     method: "GET",
//     params,
//   });

// export const getJobDescriptionById = (id) =>
//   hrmsRequest({
//     url: HRMS_API.MAINTAINANCE.JOB_DESCRIPTION_LIST,
//     method: "GET",
//     params: { id },
//   });

// export const saveJobDescription = (payload = {}) =>
//   hrmsRequest({
//     url: HRMS_API.MAINTAINANCE.JOB_DESCRIPTION_SAVE,
//     method: "POST",
//     data: payload,
//   });

//   export const getKRAList = async () => {
//   return request({
//     api: hrmsAPI,
//     url: "/getJobDescriptionMasters.php?type=kra",
//     method: "GET",
//     fallback: { status: false, data: [] },
//   });
// };

// export const getQualificationList = async () => {
//   return request({
//     api: hrmsAPI,
//     url: "/getJobDescriptionMasters.php?type=qualification",
//     method: "GET",
//     fallback: { status: false, data: [] },
//   });
// };

// export const getSkillList = async () => {
//   return request({
//     api: hrmsAPI,
//     url: "/getJobDescriptionMasters.php?type=skill",
//     method: "GET",
//     fallback: { status: false, data: [] },
//   });
// };

// export const getExpertiseLevelList = async () => {
//   return request({
//     api: hrmsAPI,
//     url: "/getJobDescriptionMasters.php?type=expertise",
//     method: "GET",
//     fallback: { status: false, data: [] },
//   });
// };

// export const getAllowanceList = async () => {
//   return request({
//     api: hrmsAPI,
//     url: "/getJobDescriptionMasters.php?type=allowance",
//     method: "GET",
//     fallback: { status: false, data: [] },
//   });
// };

// export const getFrequencyList = async () => {
//   return request({
//     api: hrmsAPI,
//     url: "/getJobDescriptionMasters.php?type=frequency",
//     method: "GET",
//     fallback: { status: false, data: [] },
//   });
// };

// export const getCTCHeadList = async () => {
//   return request({
//     api: hrmsAPI,
//     url: "/getJobDescriptionMasters.php?type=ctc_head",
//     method: "GET",
//     fallback: { status: false, data: [] },
//   });
// };

// export const getFormulaList = async () => {
//   return request({
//     api: hrmsAPI,
//     url: "/getJobDescriptionMasters.php?type=formula",
//     method: "GET",
//     fallback: { status: false, data: [] },
//   });
// };

// export const getQuestionTemplateList = async () => {
//   return request({
//     api: hrmsAPI,
//     url: "/getJobDescriptionMasters.php?type=question_template",
//     method: "GET",
//     fallback: { status: false, data: [] },
//   });
// };

// export const getDivisionList = async () => {
//   return request({
//     api: hrmsAPI,
//     url: "/getJobDescriptionMasters.php?type=division",
//     method: "GET",
//     fallback: { status: false, data: [] },
//   });
// };

// export const getInductionList = async () => {
//   return request({
//     api: hrmsAPI,
//     url: "/getJobDescriptionMasters.php?type=induction",
//     method: "GET",
//     fallback: { status: false, data: [] },
//   });
// };

// export const getOrganogramList = async () => {
//   return request({
//     api: hrmsAPI,
//     url: "/getJobDescriptionMasters.php?type=organogram",
//     method: "GET",
//     fallback: { status: false, data: [] },
//   });
// };

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
    url: "/getJobDescriptionMasters.php",
    method: "GET",
    params: { type },
  });

export const getKRAList = () =>
  getJDMaster("kra");

export const getQualificationList = () =>
  getJDMaster("qualification");

export const getSkillList = () =>
  getJDMaster("skill");

export const getExpertiseLevelList = () =>
  getJDMaster("expertise");

export const getAllowanceList = () =>
  getJDMaster("allowance");

export const getFrequencyList = () =>
  getJDMaster("frequency");

export const getCTCHeadList = () =>
  getJDMaster("ctc_head");

export const getFormulaList = () =>
  getJDMaster("formula");

export const getQuestionTemplateList = () =>
  getJDMaster("question_template");

export const getDivisionList = () =>
  getJDMaster("division");

export const getInductionList = () =>
  getJDMaster("induction");

export const getOrganogramList = () =>
  getJDMaster("organogram");