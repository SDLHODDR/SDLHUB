import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useCareersAuth } from '../careersAuthContext'
import { forgotCandidatePassword, loginCandidate, registerCandidate } from '../services/careersApi'

const EMPTY_REGISTER = { name: '', email: '', mobile: '', country: 'India', password: '', confirm: '' }

const Field = ({ id, label, error, children }) => (
  <div className='mb-3'>
    <label className='form-label fw-semibold' htmlFor={id}>
      {label}
    </label>
    {children}
    {error && <div className='invalid-feedback d-block'>{error}</div>}
  </div>
)

/* Careers login / registration / forgot password (legacy careers/index.php + login.php). */
const CareersLogin = () => {
  const { candidate, setCandidate, countries } = useCareersAuth()
  const navigate = useNavigate()
  const [view, setView] = useState('login')
  const [login, setLogin] = useState({ username: '', password: '' })
  const [register, setRegister] = useState(EMPTY_REGISTER)
  const [mobile, setMobile] = useState('')
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (candidate) {
    return <Navigate to={candidate.verified ? '/careers/jobs' : '/careers/verify'} replace />
  }

  const switchView = next => {
    setView(next)
    setErrors({})
    setMessage(null)
  }

  const finishLogin = result => {
    const next = result.data.candidate
    setCandidate(next)
    navigate(next.verified ? '/careers/jobs' : '/careers/verify', {
      replace: true,
      state: result.data.debugOtp ? { debugOtp: result.data.debugOtp } : undefined
    })
  }

  const handleLogin = async event => {
    event.preventDefault()
    const next = {}
    if (!login.username.trim()) next.username = 'Enter your email address or mobile number.'
    if (!login.password) next.password = 'Enter your password.'
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true)
    setMessage(null)
    const result = await loginCandidate(login.username.trim(), login.password)
    setBusy(false)
    if (result?.status) finishLogin(result)
    else setMessage({ type: 'danger', text: result?.message || 'Unable to log in.' })
  }

  const handleRegister = async event => {
    event.preventDefault()
    const next = {}
    if (!register.name.trim()) next.name = 'Enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(register.email.trim())) next.email = 'Enter a valid email address.'
    if (!/^\+?[0-9]{10,15}$/.test(register.mobile.replace(/\s+/g, ''))) next.mobile = 'Enter a valid mobile number.'
    if (!register.country) next.country = 'Select your country.'
    if (register.password.length < 8) next.password = 'Use at least 8 characters.'
    if (register.confirm !== register.password) next.confirm = 'Passwords do not match.'
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true)
    setMessage(null)
    const result = await registerCandidate({
      name: register.name.trim(),
      email: register.email.trim(),
      mobile: register.mobile.replace(/\s+/g, ''),
      country: register.country,
      password: register.password
    })
    setBusy(false)
    if (result?.status) finishLogin(result)
    else setMessage({ type: 'danger', text: result?.message || 'Unable to create your account.' })
  }

  const handleForgot = async event => {
    event.preventDefault()
    if (!/^\+?[0-9]{10,15}$/.test(mobile.replace(/\s+/g, ''))) {
      setErrors({ mobile: 'Enter your registered mobile number.' })
      return
    }
    setErrors({})
    setBusy(true)
    const result = await forgotCandidatePassword(mobile.replace(/\s+/g, ''))
    setBusy(false)
    const debug = result?.data?.debugOtp?.password ? ` (development: ${result.data.debugOtp.password})` : ''
    setMessage({ type: result?.status ? 'success' : 'danger', text: (result?.message || 'Unable to reset the password.') + debug })
  }

  const input = (form, setForm, key, props = {}) => (
    <input
      id={`careers-${key}`}
      className={`form-control${errors[key] ? ' is-invalid' : ''}`}
      value={form[key]}
      onChange={event => {
        setForm(current => ({ ...current, [key]: event.target.value }))
        setErrors(current => ({ ...current, [key]: '' }))
      }}
      disabled={busy}
      {...props}
    />
  )

  return (
    <div className='careers-page d-flex align-items-center justify-content-center p-3'>
      <div className='careers-card careers-auth'>
        <div className='careers-card-header text-center'>
          <h1 className='h4 mb-1'>Careers at Shree Dhootapapeshwar Ltd.</h1>
          <p className='text-muted mb-0 small'>
            {view === 'register'
              ? 'Create your account to apply for jobs.'
              : view === 'forgot'
                ? 'We will send a new password to your registered mobile number and email.'
                : 'Log in with your email address or mobile number.'}
          </p>
        </div>
        <div className='careers-card-body'>
          {message && (
            <div className={`alert alert-${message.type} py-2`} role='alert'>
              {message.text}
            </div>
          )}

          {view === 'login' && (
            <form onSubmit={handleLogin} noValidate>
              <Field id='careers-username' label='Email or Mobile Number' error={errors.username}>
                {input(login, setLogin, 'username', { autoComplete: 'username', autoFocus: true })}
              </Field>
              <Field id='careers-password' label='Password' error={errors.password}>
                <div className='input-group'>
                  {input(login, setLogin, 'password', {
                    type: showPassword ? 'text' : 'password',
                    autoComplete: 'current-password'
                  })}
                  <button
                    type='button'
                    className='btn btn-outline-secondary'
                    onClick={() => setShowPassword(value => !value)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`} />
                  </button>
                </div>
              </Field>
              <div className='text-end mb-3'>
                <button type='button' className='btn btn-link p-0 small' onClick={() => switchView('forgot')}>
                  Forgot password?
                </button>
              </div>
              <button type='submit' className='btn btn-primary w-100' disabled={busy}>
                {busy ? 'Logging in...' : 'Log In'}
              </button>
              <p className='text-center mt-3 mb-0 small'>
                New here?{' '}
                <button type='button' className='btn btn-link p-0 align-baseline' onClick={() => switchView('register')}>
                  Create an account
                </button>
              </p>
            </form>
          )}

          {view === 'register' && (
            <form onSubmit={handleRegister} noValidate>
              <Field id='careers-name' label='Full Name' error={errors.name}>
                {input(register, setRegister, 'name', { autoComplete: 'name', maxLength: 300, autoFocus: true })}
              </Field>
              <Field id='careers-email' label='Email Address' error={errors.email}>
                {input(register, setRegister, 'email', { type: 'email', autoComplete: 'email', maxLength: 100 })}
              </Field>
              <div className='row g-2'>
                <div className='col-sm-5'>
                  <Field id='careers-country' label='Country' error={errors.country}>
                    <select
                      id='careers-country'
                      className={`form-select${errors.country ? ' is-invalid' : ''}`}
                      value={register.country}
                      onChange={event => setRegister(current => ({ ...current, country: event.target.value }))}
                      disabled={busy}
                    >
                      {countries.map(country => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className='col-sm-7'>
                  <Field id='careers-mobile' label='Mobile Number' error={errors.mobile}>
                    {input(register, setRegister, 'mobile', { type: 'tel', autoComplete: 'tel', maxLength: 16 })}
                  </Field>
                </div>
              </div>
              <Field id='careers-password' label='Password' error={errors.password}>
                {input(register, setRegister, 'password', { type: 'password', autoComplete: 'new-password', maxLength: 50 })}
              </Field>
              <Field id='careers-confirm' label='Confirm Password' error={errors.confirm}>
                {input(register, setRegister, 'confirm', { type: 'password', autoComplete: 'new-password', maxLength: 50 })}
              </Field>
              <button type='submit' className='btn btn-primary w-100' disabled={busy}>
                {busy ? 'Creating account...' : 'Create Account'}
              </button>
              <p className='text-center mt-3 mb-0 small'>
                Already registered?{' '}
                <button type='button' className='btn btn-link p-0 align-baseline' onClick={() => switchView('login')}>
                  Log in
                </button>
              </p>
            </form>
          )}

          {view === 'forgot' && (
            <form onSubmit={handleForgot} noValidate>
              <Field id='careers-forgot-mobile' label='Registered Mobile Number' error={errors.mobile}>
                <input
                  id='careers-forgot-mobile'
                  type='tel'
                  className={`form-control${errors.mobile ? ' is-invalid' : ''}`}
                  value={mobile}
                  onChange={event => setMobile(event.target.value)}
                  maxLength={16}
                  disabled={busy}
                  autoFocus
                />
              </Field>
              <button type='submit' className='btn btn-primary w-100' disabled={busy}>
                {busy ? 'Sending...' : 'Send New Password'}
              </button>
              <p className='text-center mt-3 mb-0 small'>
                <button type='button' className='btn btn-link p-0' onClick={() => switchView('login')}>
                  Back to login
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default CareersLogin
