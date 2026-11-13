import { hrmsRequest } from '../../../shared/services/request'
import { HRMS_API } from '../config/hrmsApiConfig'

const API = HRMS_API.MENU_REPORTS

/** Dropdown options of a report's filter page (report: followup | jdmaster | orgmaster). */
export const getReportOptions = (report, params = {}) =>
  hrmsRequest({ url: API.GET_OPTIONS, method: 'GET', params: { report, ...params }, dedupe: false })

const reportUrl = (path, params) =>
  `${import.meta.env.VITE_API_URL || ''}/hrms${path}?${new URLSearchParams(params).toString()}`

/** Opens the report PDF in a new tab; the session cookie authorises it. */
const openReport = (path, params) => window.open(reportUrl(path, params), '_blank', 'noopener')

export const openFollowUpReport = params => openReport(API.FOLLOW_UP, params)
export const openJdMasterReport = params => openReport(API.JD_MASTER, params)
export const openOrganogramMasterReport = params => openReport(API.ORGANOGRAM_MASTER, params)
export const openTenureChangeReport = params => openReport(API.TENURE_CHANGE, params)
export const openOrganogramHierarchyReport = params => openReport(API.ORGANOGRAM_HIERARCHY, params)
export const openCandidateTrackerReport = params => openReport(API.CANDIDATE_TRACKER, params)
export const openOpenPositionsReport = params => openReport(API.OPEN_POSITIONS, params)
export const openRequisitionTrackerReport = params => openReport(API.REQUISITION_TRACKER, params)

/** Organogram tree under a location, for the visual hierarchy chart. */
export const getOrganogramHierarchyTree = orgLocId =>
  hrmsRequest({ url: API.ORGANOGRAM_HIERARCHY_TREE, method: 'GET', params: { org_loc_id: orgLocId }, dedupe: false })

/** The visual hierarchy chart opens as an SDL Hub page in a new tab. */
export const openOrganogramHierarchyChart = orgLocId =>
  window.open(
    `${import.meta.env.BASE_URL.replace(/\/$/, '')}/hrms/reports/organogram-hierarchy-visual/chart?org_loc_id=${encodeURIComponent(orgLocId)}`,
    '_blank',
    'noopener'
  )
