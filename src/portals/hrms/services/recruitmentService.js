import { hrmsRequest } from '../../../shared/services/request'
import { downloadFile } from '../../../shared/services/downloadFile'
import { HRMS_API } from '../config/hrmsApiConfig'

const API = HRMS_API.RECRUITMENT

const get = (url, params) => hrmsRequest({ url, method: 'GET', params, dedupe: false })
const post = (url, data) => hrmsRequest({ url, method: 'POST', data })

export const getCandidates = params => get(API.GET_CANDIDATES, params)
export const getCandidateDetails = id => get(API.GET_CANDIDATE_DETAILS, { id })
export const getCandidateForm = id => get(API.GET_CANDIDATE_FORM, { id })
export const getScreenRemark = id => get(API.GET_SCREEN_REMARK, { id })
export const saveScreenRemark = data => post(API.SAVE_SCREEN_REMARK, data)
export const getCandidateFollowUps = canId => get(API.GET_FOLLOW_UPS, { can_id: canId })
export const getRequestFollowUps = reqId => get(API.GET_FOLLOW_UPS, { req_id: reqId })
export const saveFollowUp = data => post(API.SAVE_FOLLOW_UP, data)
export const blockCandidate = canId => post(API.BLOCK_CANDIDATE, { can_id: canId })

export const getRecruitmentRequests = () => get(API.GET_REQUESTS)
export const getRecruitmentRequest = id => get(API.GET_REQUESTS, { id })
export const getOrganogramLocations = (orgId, recId) =>
  get(API.GET_ORGANOGRAM_LOCATIONS, { org_id: orgId, rec_id: recId || undefined })
export const saveRecruitmentRequest = data => post(API.SAVE_REQUEST, data)
export const cancelRecruitmentRequest = id => post(API.CANCEL_REQUEST, { id })

export const getPendingRecruitments = () => get(API.GET_PENDING)

export const getRecruitmentTask = ({ taskId, userTaskId }) =>
  get(API.GET_TASK, { task_id: taskId, user_task_id: userTaskId })
export const processRecruitmentTask = data => post(API.PROCESS_TASK, data)

// Tasks 6-22 (Send Suitable Candidates to Update Offer Acceptance).
export const getRecruitmentFlowTask = ({ taskId, userTaskId }) =>
  get(API.GET_FLOW_TASK, { task_id: taskId, user_task_id: userTaskId })
export const processRecruitmentFlowTask = data => post(API.PROCESS_FLOW_TASK, data)
export const offerLetterUrl = userTaskId =>
  `${import.meta.env.VITE_API_URL || ''}/hrms${API.OFFER_LETTER}?user_task_id=${encodeURIComponent(userTaskId)}`

export const exportCandidates = async ({ format, ...params }) => {
  const response = await hrmsRequest({
    url: API.EXPORT_CANDIDATES,
    method: 'GET',
    params: { format, ...params },
    responseType: 'blob'
  })
  downloadFile(response, `HRMS.${format}`)
}
