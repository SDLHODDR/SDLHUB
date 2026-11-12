import axios from 'axios'

/*
 * API client of the candidate portal. Separate from the employee clients on
 * purpose: no employee session interceptors / redirects, and its own CSRF token
 * (issued by careers/session.php, sent as X-CSRF-Token on every POST).
 */
const careersApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/careers`,
  withCredentials: true,
  timeout: 30000
})

let csrfToken = ''

export const setCareersCsrfToken = token => {
  csrfToken = token || ''
}

careersApi.interceptors.request.use(config => {
  if (csrfToken && (config.method || 'get').toLowerCase() !== 'get') {
    config.headers['X-CSRF-Token'] = csrfToken
  }
  return config
})

/** Returns the API body ({ status, message, data }) for success and handled errors alike. */
const unwrap = async promise => {
  try {
    const response = await promise
    return response.data
  } catch (error) {
    const body = error?.response?.data
    if (body && typeof body === 'object' && 'status' in body) {
      return { ...body, httpStatus: error.response.status }
    }
    return {
      status: false,
      message: error?.code === 'ECONNABORTED'
        ? 'The server is taking too long. Please try again.'
        : 'Unable to reach the server. Please check your connection and try again.',
      httpStatus: error?.response?.status || 0
    }
  }
}

const get = (url, params) => unwrap(careersApi.get(url, { params }))

/** POST; on an expired CSRF token (419) the token is refreshed and the call retried once. */
const post = async (url, data, config) => {
  const result = await unwrap(careersApi.post(url, data, config))
  if (result?.httpStatus === 419) {
    const session = await getCareersSession()
    if (session?.status) {
      return unwrap(careersApi.post(url, data, config))
    }
  }
  return result
}

export const getCareersSession = async () => {
  const result = await get('/getSession.php')
  if (result?.status) setCareersCsrfToken(result.data?.csrfToken)
  return result
}

const authAction = async (action, data = {}) => {
  const result = await post('/auth.php', { action, ...data })
  if (result?.status && result.data?.csrfToken) setCareersCsrfToken(result.data.csrfToken)
  return result
}

export const loginCandidate = (username, password) => authAction('login', { username, password })
export const registerCandidate = data => authAction('register', data)
export const verifyCandidate = (emailOtp, mobileOtp) =>
  authAction('verify', { email_otp: emailOtp, mobile_otp: mobileOtp })
export const resendCandidateOtp = () => authAction('resend')
export const forgotCandidatePassword = mobile => authAction('forgot', { mobile })
export const logoutCandidate = () => authAction('logout')

export const getJobs = params => get('/jobs.php', { view: 'list', ...params })
export const getJob = recId => get('/jobs.php', { view: 'detail', rec_id: recId })
export const applyForJob = recId => post('/apply.php', { rec_id: recId })

export const getProfile = () => get('/profile.php')
export const saveProfileSection = (section, data) => post('/saveProfile.php', { section, action: 'save', data })
export const addProfileEntry = (section, data) => post('/saveProfile.php', { section, action: 'add', data })
export const deleteProfileEntry = (section, id) => post('/saveProfile.php', { section, action: 'delete', id })

export const uploadDocument = (type, file) => {
  const form = new FormData()
  form.append('type', type)
  form.append('file', file)
  return post('/document.php', form)
}

export const documentUrl = type =>
  `${import.meta.env.VITE_API_URL || ''}/careers/document.php?type=${encodeURIComponent(type)}`
