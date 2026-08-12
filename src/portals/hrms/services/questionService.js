import { hrmsRequest } from "../../../services/request";
import { HRMS_API } from "../config/hrmsApiConfig";

export const getQuestions = async (params = {}) => {
  return hrmsRequest({
    url: HRMS_API.MAINTAINANCE.QUESTION_GET,
    method: "GET",
  });
};

export const saveQuestion = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MAINTAINANCE.QUESTION_SAVE,
    method: "POST",
    data: payload,
  });
};

export const deleteQuestion = async (payload = {}) => {
  return hrmsRequest({
    url: HRMS_API.MAINTAINANCE.QUESTION_DELETE,
    method: "POST",
    data: payload,
  });
};

export const getQuestionGroups = async () => {
  return hrmsRequest({
    url: HRMS_API.MAINTAINANCE.QUESTION_GROUPS,
    method: "GET",
  });
};

export const getQuestionSubGroups = async (groupId) => {
  return hrmsRequest({
    url: HRMS_API.MAINTAINANCE.QUESTION_SUBGROUPS,
    method: "GET",
    params: groupId ? { groupId } : undefined,
  });
};

// Fetch all question sub-groups (independent list)
export const getAllQuestionSubGroups = async () => {
  return hrmsRequest({
    url: HRMS_API.MAINTAINANCE.QUESTION_SUBGROUPS,
    method: "GET",
  });
};
