import { Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { CareersAuthProvider } from './CareersAuth'
import { useCareersAuth } from './careersAuthContext'
import CareersLogin from './pages/CareersLogin'
import CareersVerify from './pages/CareersVerify'
import CareersJobs from './pages/CareersJobs'
import CareersJobDetail from './pages/CareersJobDetail'
import CareersApplicationForm from './pages/CareersApplicationForm'
import CareersAppliedJobs from './pages/CareersAppliedJobs'
import './careers.css'

const FullPageMessage = ({ children }) => (
  <div className='careers-page d-flex align-items-center justify-content-center' style={{ minHeight: '100vh' }}>
    <div className='text-center careers-muted-on-white'>{children}</div>
  </div>
)

/* Logged-in area: verified candidates only. */
const CandidateArea = () => {
  const { candidate } = useCareersAuth()
  if (!candidate) return <Navigate to='/careers/login' replace />
  if (!candidate.verified) return <Navigate to='/careers/verify' replace />
  return <CareersLayout />
}

const CareersLayout = () => {
  const { candidate, logout } = useCareersAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/careers/login', { replace: true })
  }

  const link = ({ isActive }) => `careers-nav-link${isActive ? ' active' : ''}`

  return (
    <div className='careers-shell'>
      <header className='careers-header'>
        <div className='container d-flex flex-wrap align-items-center gap-2 py-2'>
          <span className='careers-brand me-3'>Careers at SDL</span>
          <nav className='d-flex flex-wrap gap-1 flex-grow-1' aria-label='Careers'>
            <NavLink to='/careers/jobs' className={link}>
              Dashboard
            </NavLink>
            <NavLink to='/careers/application-form' className={link}>
              Application Form
            </NavLink>
            <NavLink to='/careers/applied-jobs' className={link}>
              Applied Jobs
            </NavLink>
          </nav>
          <span className='text-white-50 small d-none d-md-inline me-2'>{candidate?.name}</span>
          <button type='button' className='careers-nav-link btn btn-link p-0 px-2' onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <main className='careers-main'>
        <div className='container py-4'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

const CareersRoutes = () => {
  const { loading, error, candidate } = useCareersAuth()

  if (loading) {
    return (
      <FullPageMessage>
        <div className='spinner-border mb-3' role='status' />
        <div>Loading...</div>
      </FullPageMessage>
    )
  }
  if (error && !candidate) {
    return (
      <FullPageMessage>
        <p className='mb-3'>{error}</p>
        <button type='button' className='btn careers-btn' onClick={() => window.location.reload()}>
          Try again
        </button>
      </FullPageMessage>
    )
  }

  return (
    <Routes>
      <Route path='login' element={<CareersLogin />} />
      <Route path='verify' element={<CareersVerify />} />
      <Route element={<CandidateArea />}>
        <Route path='jobs' element={<CareersJobs />} />
        <Route path='jobs/:recId' element={<CareersJobDetail />} />
        <Route path='application-form' element={<CareersApplicationForm />} />
        <Route path='applied-jobs' element={<CareersAppliedJobs />} />
      </Route>
      <Route path='*' element={<Navigate to={candidate ? '/careers/jobs' : '/careers/login'} replace />} />
    </Routes>
  )
}

/*
 * Careers (candidate portal, legacy hradmin/careers). Public: candidates log in with
 * their own account; employee login and HRMS profiles are not involved.
 */
const CareersApp = () => (
  <CareersAuthProvider>
    <CareersRoutes />
  </CareersAuthProvider>
)

export default CareersApp
