import { request } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

export const getQuestions = async (params = {}) => {
  return request({
    url: HRMS_API.MAINTAINANCE.QUESTION_GET,
    method: "GET",
    params,
  });
};

export const saveQuestion = async (payload = {}) => {
  return request({
    url: HRMS_API.MAINTAINANCE.QUESTION_SAVE,
    method: "POST",
    data: payload,
  });
};

export const deleteQuestion = async (payload = {}) => {
  return request({
    url: HRMS_API.MAINTAINANCE.QUESTION_DELETE,
    method: "POST",
    data: payload,
  });
};

export const getQuestionGroups = async () => {
  return request({
    url: HRMS_API.MAINTAINANCE.QUESTION_GROUPS,
    method: "GET",
  });
};

export const getQuestionSubGroups = async (groupId) => {
  return request({
    url: HRMS_API.MAINTAINANCE.QUESTION_SUBGROUPS,
    method: "GET",
    params: { groupId },
  });
};
