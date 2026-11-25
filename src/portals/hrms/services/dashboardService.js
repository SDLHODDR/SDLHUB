import { hrmsRequest } from '../../../shared/services/request'
import { HRMS_API } from '../config/hrmsApiConfig'

export const getHrmsDashboard = () =>
  // dedupe: a second call while one is in flight (React StrictMode runs effects
  // twice in development) reuses it instead of sending another request.
  hrmsRequest({ url: HRMS_API.DASHBOARD.GET, method: 'GET', dedupe: true })
