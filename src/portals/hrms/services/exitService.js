import { hrmsRequest } from '../../../shared/services/request'
import { HRMS_API } from '../config/hrmsApiConfig'

export const getExitTaskDetails = ({ taskId, userTaskId }) =>
  hrmsRequest({
    url: HRMS_API.EXIT.GET_TASK_DETAILS,
    method: 'GET',
    params: { task_id: taskId, user_task_id: userTaskId },
    dedupe: false
  })

const post = url => data => hrmsRequest({ url, method: 'POST', data })

export const getSeparationRequests = () =>
  hrmsRequest({
    url: HRMS_API.EXIT.GET_SEPARATION_REQUESTS,
    method: 'GET',
    dedupe: true
  })

export const getSeparationRequest = id =>
  hrmsRequest({
    url: HRMS_API.EXIT.GET_SEPARATION_REQUESTS,
    method: 'GET',
    params: { id }
  })

export const saveSeparationRequest = post(HRMS_API.EXIT.SAVE_SEPARATION_REQUEST)

export const saveExitSeparation = post(HRMS_API.EXIT.SAVE_SEPARATION)
export const saveExitInterview = post(HRMS_API.EXIT.SAVE_INTERVIEW)
export const saveExitActivity = post(HRMS_API.EXIT.SAVE_ACTIVITY)
export const deactivateExitEmployee = post(HRMS_API.EXIT.DEACTIVATE_EMPLOYEE)
export const generateExitLetterReference = post(HRMS_API.EXIT.GENERATE_LETTER_REFERENCE)
export const closeExitLetterTask = post(HRMS_API.EXIT.CLOSE_LETTER_TASK)
