import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useCareersAuth } from '../careersAuthContext'
import { resendCandidateOtp, verifyCandidate } from '../services/careersApi'

/* Email / mobile OTP confirmation (legacy careers/verify_email_mob.php). */
const CareersVerify = () => {
  const { candidate, setCandidate, logout } = useCareersAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [emailOtp, setEmailOtp] = useState('')
  const [mobileOtp, setMobileOtp] = useState('')
  const [message, setMessage] = useState(null)
  const [debugOtp, setDebugOtp] = useState(location.state?.debugOtp || null)
  const [busy, setBusy] = useState('')

  if (!candidate) return <Navigate to='/careers/login' replace />
  if (candidate.verified) return <Navigate to='/careers/jobs' replace />

  const needsMobile = candidate.mobileVerificationRequired

  const handleVerify = async event => {
    event.preventDefault()
    if (!/^[0-9]{6}$/.test(emailOtp) || (needsMobile && !/^[0-9]{6}$/.test(mobileOtp))) {
      setMessage({ type: 'danger', text: 'Please enter the 6 digit OTP' + (needsMobile ? 's.' : '.') })
      return
    }
    setBusy('verify')
    const result = await verifyCandidate(emailOtp, mobileOtp)
    setBusy('')
    if (result?.status) {
      setCandidate(result.data.candidate)
      navigate('/careers/application-form', { replace: true })
    } else {
      setMessage({ type: 'danger', text: result?.message || 'Unable to verify the OTP.' })
    }
  }

  const handleResend = async () => {
    setBusy('resend')
    const result = await resendCandidateOtp()
    setBusy('')
    setDebugOtp(result?.data?.debugOtp || null)
    setMessage({ type: result?.status ? 'success' : 'danger', text: result?.message || 'Unable to send a new OTP.' })
  }

  const handleLogout = async () => {
    await logout()
    navigate('/careers/login', { replace: true })
  }

  const otpInput = (id, value, setValue) => (
    <input
      id={id}
      className='form-control careers-otp-input'
      inputMode='numeric'
      autoComplete='one-time-code'
      maxLength={6}
      value={value}
      onChange={event => setValue(event.target.value.replace(/[^0-9]/g, ''))}
      disabled={Boolean(busy)}
    />
  )

  return (
    <div className='careers-page d-flex align-items-center justify-content-center p-3'>
      <div className='careers-card careers-auth'>
        <div className='careers-card-header text-center'>
          <h1 className='h4 mb-1'>Verify Your Account</h1>
          <p className='text-muted mb-0 small'>
            Enter the OTP sent to <strong>{candidate.email}</strong>
            {needsMobile && (
              <>
                {' '}
                and to <strong>{candidate.mobile}</strong>
              </>
            )}
            .
          </p>
        </div>
        <form className='careers-card-body' onSubmit={handleVerify} noValidate>
          {message && (
            <div className={`alert alert-${message.type} py-2`} role='alert'>
              {message.text}
            </div>
          )}
          {debugOtp && (
            <div className='alert alert-warning py-2 small'>
              Development mode: email OTP {debugOtp.email}
              {needsMobile ? `, mobile OTP ${debugOtp.mobile}` : ''}
            </div>
          )}
          <div className='mb-3'>
            <label className='form-label fw-semibold' htmlFor='careers-email-otp'>
              Email OTP
            </label>
            {otpInput('careers-email-otp', emailOtp, setEmailOtp)}
          </div>
          {needsMobile && (
            <div className='mb-3'>
              <label className='form-label fw-semibold' htmlFor='careers-mobile-otp'>
                Mobile OTP
              </label>
              {otpInput('careers-mobile-otp', mobileOtp, setMobileOtp)}
            </div>
          )}
          <button type='submit' className='btn btn-primary w-100' disabled={Boolean(busy)}>
            {busy === 'verify' ? 'Verifying...' : 'Verify'}
          </button>
          <div className='d-flex justify-content-between mt-3 small'>
            <button type='button' className='btn btn-link p-0' onClick={handleResend} disabled={Boolean(busy)}>
              {busy === 'resend' ? 'Sending...' : 'Resend OTP'}
            </button>
            <button type='button' className='btn btn-link p-0 text-muted' onClick={handleLogout} disabled={Boolean(busy)}>
              Use another account
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CareersVerify
