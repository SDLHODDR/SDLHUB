import { useEffect, useState } from 'react'
import RecruitmentModal from './RecruitmentModal'
import SaveButton from '../../../../shared/components/buttons/SaveButton'
import SDLCalendar from '../../../../shared/components/calendar/SDLCalendar'
import { parseDateValue, toDateInputValue } from '../../../../shared/utils/commonUtils'
import { notifySuccess } from '../../../../shared/services/alertService'
import { REMARK_MAX_LENGTH } from './recruitmentOptions'
import { getRequestFollowUps, saveFollowUp } from '../../services/recruitmentService'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MOBILE_PATTERN = /^[0-9+\- ]{7,20}$/

/* Candidate-search log of a request: people contacted who are not in the system yet.
   Legacy pending_recruitments.php followUp(reqId). */
const RequestFollowUpModal = ({ request, onClose }) => {
  const [form, setForm] = useState({ date: toDateInputValue(new Date()), name: '', mobile: '', email: '', remarks: '' })
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  const loadHistory = async () => {
    const response = await getRequestFollowUps(request.id)
    if (!response?.status) throw new Error(response?.message)
    return response.data.history || []
  }

  useEffect(() => {
    let active = true
    getRequestFollowUps(request.id)
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        if (active) setHistory(response.data.history || [])
      })
      .catch(error => {
        if (active) setLoadError(error?.message || 'Unable to load the follow-ups.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [request.id])

  const update = (field, value) => {
    setForm(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: '' }))
  }

  const save = async () => {
    const next = {}
    if (!form.date) next.date = 'Date is required.'
    if (!form.name.trim()) next.name = 'Candidate name is required.'
    if (!MOBILE_PATTERN.test(form.mobile.trim())) next.mobile = 'Please enter a valid mobile number.'
    if (!EMAIL_PATTERN.test(form.email.trim())) next.email = 'Please enter a valid email address.'
    if (!form.remarks.trim()) next.remarks = 'Remarks are required.'
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    setSaveError('')
    try {
      const response = await saveFollowUp({
        req_id: request.id,
        ason_date: form.date,
        can_name: form.name.trim(),
        can_mobile: form.mobile.trim(),
        can_email: form.email.trim(),
        remarks: form.remarks.trim()
      })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      setForm(current => ({ ...current, name: '', mobile: '', email: '', remarks: '' }))
      setHistory(await loadHistory())
    } catch (error) {
      setSaveError(error?.message || 'Unable to save the follow-up.')
    } finally {
      setSaving(false)
    }
  }

  const fieldError = field =>
    errors[field] && <small className='text-danger d-block mt-1'>{errors[field]}</small>
  const fieldClass = field => `form-control${errors[field] ? ' is-invalid' : ''}`
  const required = <span className='text-danger'> *</span>

  return (
    <RecruitmentModal
      titleId='request-follow-up-title'
      title={`Add FollowUp Details - #REQ${request.id}`}
      loading={loading}
      loadError={loadError}
      onClose={onClose}
      footer={<SaveButton onClick={save} isSubmitting={saving}>Save</SaveButton>}
    >
      {saveError && <div className='alert alert-danger py-2'>{saveError}</div>}
      <div className='row g-3'>
        <div className='col-md-6'>
          <label className='form-label'>Date{required}</label>
          <SDLCalendar
            value={parseDateValue(form.date)}
            allowAllDates
            inputClassName={errors.date ? 'is-invalid' : ''}
            onChange={date => update('date', toDateInputValue(date))}
          />
          {fieldError('date')}
        </div>
        <div className='col-md-6'>
          <label className='form-label' htmlFor='request-follow-up-name'>Candidate Name{required}</label>
          <input
            id='request-follow-up-name'
            className={fieldClass('name')}
            maxLength={50}
            value={form.name}
            onChange={event => update('name', event.target.value)}
          />
          {fieldError('name')}
        </div>
        <div className='col-md-6'>
          <label className='form-label' htmlFor='request-follow-up-mobile'>Mobile No{required}</label>
          <input
            id='request-follow-up-mobile'
            className={fieldClass('mobile')}
            maxLength={20}
            value={form.mobile}
            onChange={event => update('mobile', event.target.value)}
          />
          {fieldError('mobile')}
        </div>
        <div className='col-md-6'>
          <label className='form-label' htmlFor='request-follow-up-email'>Email Address{required}</label>
          <input
            id='request-follow-up-email'
            type='email'
            className={fieldClass('email')}
            maxLength={50}
            value={form.email}
            onChange={event => update('email', event.target.value)}
          />
          {fieldError('email')}
        </div>
        <div className='col-12'>
          <label className='form-label' htmlFor='request-follow-up-remarks'>Remarks{required}</label>
          <textarea
            id='request-follow-up-remarks'
            className={fieldClass('remarks')}
            rows={3}
            maxLength={REMARK_MAX_LENGTH}
            value={form.remarks}
            onChange={event => update('remarks', event.target.value)}
          />
          {fieldError('remarks')}
        </div>
      </div>

      {history.length > 0 && (
        <div className='table-responsive mt-3'>
          <table className='table table-striped table-bordered mb-0'>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, index) => (
                <tr key={index}>
                  <td className='text-nowrap'>{row.date}</td>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.mobile}</td>
                  <td>{row.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </RecruitmentModal>
  )
}

export default RequestFollowUpModal
