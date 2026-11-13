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
