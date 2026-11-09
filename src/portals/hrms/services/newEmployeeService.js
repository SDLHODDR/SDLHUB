import { hrmsRequest } from '../../../shared/services/request'
import { HRMS_API } from '../config/hrmsApiConfig'

const post = url => data => hrmsRequest({ url, method: 'POST', data })

export const getNewEmployeeDrafts = () =>
  hrmsRequest({ url: HRMS_API.JOINING.GET_NEW_EMPLOYEE, method: 'GET' })

export const getNewEmployee = (empCode, userTaskId) =>
  hrmsRequest({
    url: HRMS_API.JOINING.GET_NEW_EMPLOYEE,
    method: 'GET',
    params: { emp_code: empCode, user_task_id: userTaskId || undefined }
  })

export const getNewEmployeeOfficeOptions = params =>
  hrmsRequest({ url: HRMS_API.JOINING.GET_OFFICE_OPTIONS, method: 'GET', params })

export const saveNewEmployee = post(HRMS_API.JOINING.SAVE_NEW_EMPLOYEE)
export const saveNewEmployeeOffice = post(HRMS_API.JOINING.SAVE_OFFICE)
export const sendNewEmployeeForAuth = post(HRMS_API.JOINING.SEND_FOR_AUTH)
export const authorizeNewEmployee = post(HRMS_API.JOINING.AUTHORIZE)

export const getJoiningDetails = userTaskId =>
  hrmsRequest({
    url: HRMS_API.JOINING.GET_DETAILS,
    method: 'GET',
    params: { user_task_id: userTaskId }
  })

export const getJoiningCtcBreakup = params =>
  hrmsRequest({ url: HRMS_API.JOINING.GET_CTC_BREAKUP, method: 'GET', params })

export const saveJoiningDetail = post(HRMS_API.JOINING.SAVE_DETAIL)
export const deleteJoiningDetail = post(HRMS_API.JOINING.DELETE_DETAIL)
export const submitJoiningTask = post(HRMS_API.JOINING.SUBMIT_TASK)

export const getNewJoinees = () =>
  hrmsRequest({ url: HRMS_API.JOINING.GET_NEW_JOINEES, method: 'GET' })

export const saveNewJoinee = post(HRMS_API.JOINING.SAVE_NEW_JOINEE)

export const getRehireOptions = () =>
  hrmsRequest({ url: HRMS_API.JOINING.GET_REHIRE_EMPLOYEE, method: 'GET' })

export const getRehireEmployee = empCode =>
  hrmsRequest({
    url: HRMS_API.JOINING.GET_REHIRE_EMPLOYEE,
    method: 'GET',
    params: { emp_code: empCode }
  })

export const saveRehireEmployee = post(HRMS_API.JOINING.SAVE_REHIRE_EMPLOYEE)
