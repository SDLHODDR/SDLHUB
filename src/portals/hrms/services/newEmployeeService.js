import { hrmsRequest } from '../../../shared/services/request'
import { HRMS_API } from '../config/hrmsApiConfig'
import { DOC_FOLDERS, isInDocFolder, legacyDocUrl } from '../../../shared/config/documentPaths'

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

// Print Appointment Letter task (44).
export const getAppointmentLetter = userTaskId =>
  hrmsRequest({
    url: HRMS_API.JOINING.GET_APPOINTMENT_LETTER,
    method: 'GET',
    params: { user_task_id: userTaskId }
  })

export const generateAppointmentLetterReference = post(HRMS_API.JOINING.GENERATE_APPOINTMENT_REF)
export const closeAppointmentLetterTask = post(HRMS_API.JOINING.CLOSE_APPOINTMENT_LETTER)

/** PDF of the appointment letter for a template script (appointment_letter_*.php). */
export const appointmentLetterUrl = (script, empCode, userTaskId) =>
  `${import.meta.env.VITE_API_URL || ''}/hrms/reports/pdfReport/${script}?EMP_CODE=${encodeURIComponent(empCode)}&user_task_id=${encodeURIComponent(userTaskId)}`

// Employee Document Upload task (13).
export const uploadJoiningDocument = ({ userTaskId, docTypeId, file }) => {
  const data = new FormData()
  data.append('user_task_id', userTaskId)
  data.append('doc_type_id', docTypeId)
  data.append('file', file)
  return hrmsRequest({
    url: HRMS_API.JOINING.UPLOAD_DOCUMENT,
    method: 'POST',
    data,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const deleteJoiningDocument = ({ userTaskId, id }) =>
  hrmsRequest({
    url: HRMS_API.JOINING.UPLOAD_DOCUMENT,
    method: 'POST',
    data: { user_task_id: userTaskId, action: 'delete', id }
  })

/**
 * Link to an employee document. input/emp_docs paths go through the backend, which
 * serves files on this server and sends older ones to the legacy HRMS server.
 */
export const employeeDocumentUrl = docPath => {
  if (!docPath) return '#'
  if (isInDocFolder(docPath, DOC_FOLDERS.EMP_DOCS)) {
    return `${import.meta.env.VITE_API_URL || ''}/hrms${HRMS_API.JOINING.VIEW_DOCUMENT}?path=${encodeURIComponent(docPath)}`
  }
  return legacyDocUrl(docPath)
}

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
