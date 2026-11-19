import { hrmsRequest } from '../../../shared/services/request'
import { HRMS_API } from '../config/hrmsApiConfig'

const API = HRMS_API.APPRAISAL

const get = (url, params) => hrmsRequest({ url, method: 'GET', params, dedupe: false })

/** Every appraisal and the Create Appraisal form options. */
export const getAppraisalSetups = () => get(API.GET_SETUPS)
/** One appraisal with its questions and employees. */
export const getAppraisalSetup = id => get(API.GET_SETUP, { id })
/** Questions of a group to add to the appraisal. */
export const getAppraisalGroupQuestions = (id, groupId) => get(API.GET_SETUP_CHOICES, { id, qgrp_id: groupId })
/** Employees of an organogram to add to the appraisal. */
export const getAppraisalOrganogramEmployees = (id, orgId) => get(API.GET_SETUP_CHOICES, { id, org_id: orgId })
/** Save / add / delete / move / publish / close (see processAppraisalSetup.php). */
export const processAppraisalSetup = data => hrmsRequest({ url: API.PROCESS_SETUP, method: 'POST', data })

/** Published appraisals, or with an id the appraisers' progress per employee. */
export const getAppraisalStatus = id => get(API.GET_STATUS, id ? { id } : {})
/** Appraisals ready for the final appraisal, or with an id its employees. */
export const getFinalAppraisal = id => get(API.GET_FINAL, id ? { id } : {})
/** The approving appraiser's answers and remarks for an employee. */
export const getAppraiserResponse = (id, empCode) => get(API.GET_FINAL, { id, response: empCode })
/** save | submit the final recommendation of the selected employees. */
export const processFinalAppraisal = data => hrmsRequest({ url: API.PROCESS_FINAL, method: 'POST', data })

/** Employee Appraisal task (46): the employee, history, earlier appraisers and this appraiser's form. */
export const getEmployeeAppraisal = userTaskId => get(API.GET_EMPLOYEE_APPRAISAL, { user_task_id: userTaskId })
/** save | submit this appraiser's appraisal (submit hands it to the next appraiser). */
export const saveEmployeeAppraisal = data =>
  hrmsRequest({ url: API.SAVE_EMPLOYEE_APPRAISAL, method: 'POST', data })

const post = url => data => hrmsRequest({ url, method: 'POST', data })

/** CTC Change (47) / CTC Approval (48); pfBasis recalculates the structure. */
export const getAppraisalCtc = (userTaskId, pfBasis) =>
  get(API.GET_APPRAISAL_CTC, pfBasis === undefined ? { user_task_id: userTaskId } : { user_task_id: userTaskId, pf_basis: pfBasis })
export const saveAppraisalCtc = post(API.SAVE_APPRAISAL_CTC)

/** Employee Promotion (49) / Promotion Auth (50); orgId returns that organogram's free locations. */
export const getAppraisalPromotion = (userTaskId, orgId) =>
  get(API.GET_APPRAISAL_PROMOTION, orgId ? { user_task_id: userTaskId, org_id: orgId } : { user_task_id: userTaskId })
export const saveAppraisalPromotion = post(API.SAVE_APPRAISAL_PROMOTION)

/** Print Promotion Letter (51) / Print Increment Letter (52). */
export const getAppraisalLetter = userTaskId => get(API.GET_APPRAISAL_LETTER, { user_task_id: userTaskId })
export const processAppraisalLetter = post(API.PROCESS_APPRAISAL_LETTER)
export const appraisalLetterUrl = (script, empCode, userTaskId) =>
  `${import.meta.env.VITE_API_URL || ''}/hrms/reports/pdfReport/${script}?EMP_CODE=${encodeURIComponent(empCode)}&user_task_id=${encodeURIComponent(userTaskId)}`
