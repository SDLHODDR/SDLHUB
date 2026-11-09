import { hrmsRequest } from '../../../shared/services/request'
import { HRMS_API } from '../config/hrmsApiConfig'

export const getHrmsDashboard = () =>
  hrmsRequest({ url: HRMS_API.DASHBOARD.GET, method: 'GET' })
