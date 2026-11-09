import { useEffect, useState } from 'react'
import RecruitmentModal from './RecruitmentModal'
import SaveButton from '../../../../shared/components/buttons/SaveButton'
import SDLCalendar from '../../../../shared/components/calendar/SDLCalendar'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import { parseDateValue, toDateInputValue } from '../../../../shared/utils/commonUtils'
import { notifySuccess } from '../../../../shared/services/alertService'
import { REMARK_MAX_LENGTH } from './recruitmentOptions'
import { getCandidateFollowUps, saveFollowUp } from '../../services/recruitmentService'

const today = () => toDateInputValue(new Date())

/* Add FollowUp Details for a candidate (legacy candidate_info_sv.php?showFollowData). */
const CandidateFollowUpModal = ({ candidate, reqId, onClose, onSaved }) => {
  const [form, setForm] = useState({ date: today(), followedBy: '', mode: '', type: '', remarks: '' })
  const [options, setOptions] = useState({ employees: [], modes: [], types: [] })
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    getCandidateFollowUps(candidate.id)
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        if (!active) return
        const data = response.data
        setOptions({ employees: data.employees || [], modes: data.modes || [], types: data.types || [] })
        setHistory(data.history || [])
        setForm(current => ({ ...current, followedBy: data.currentEmployee || '' }))
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
  }, [candidate.id])

  const update = (field, value) => {
    setForm(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: '' }))
  }

  const save = async () => {
    const next = {}
    if (!form.date) next.date = 'Date is required.'
    if (!form.followedBy) next.followedBy = 'Follow up by is required.'
    if (!form.mode) next.mode = 'Follow up mode is required.'
    if (!form.type) next.type = 'Follow up type is required.'
    if (!form.remarks.trim()) next.remarks = 'Remarks are required.'
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    setSaveError('')
    try {
      const response = await saveFollowUp({
        can_id: candidate.id,
        req_id: reqId || undefined,
        ason_date: form.date,
        foloup_by: form.followedBy,
        fmod_id: form.mode,
        ftyp_id: form.type,
        remarks: form.remarks.trim()
      })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      onSaved()
    } catch (error) {
      setSaveError(error?.message || 'Unable to save the follow-up.')
    } finally {
      setSaving(false)
    }
  }

  const fieldError = field =>
    errors[field] && <small className='text-danger d-block mt-1'>{errors[field]}</small>
  const required = <span className='text-danger'> *</span>
  const selectClass = field => `form-select tenure-change-select${errors[field] ? ' is-invalid' : ''}`

  return (
    <RecruitmentModal
      titleId='follow-up-title'
      title='Add FollowUp Details'
      loading={loading}
      loadError={loadError}
      onClose={onClose}
      footer={<SaveButton onClick={save} isSubmitting={saving}>Save</SaveButton>}
    >
      <p className='mb-3'>
        <strong>Candidate Name: {candidate.name}</strong>
      </p>
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
          <label className='form-label'>Follow Up By{required}</label>
          <SDLReactSelect
            value={form.followedBy}
            options={options.employees}
            placeholder='Please Select'
            onChange={value => update('followedBy', value)}
          />
          {fieldError('followedBy')}
        </div>
        <div className='col-md-6'>
          <label className='form-label' htmlFor='follow-up-mode'>Follow Up Mode{required}</label>
          <select
            id='follow-up-mode'
            className={selectClass('mode')}
            value={form.mode}
            onChange={event => update('mode', event.target.value)}
          >
            <option value=''>Please Select</option>
            {options.modes.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldError('mode')}
        </div>
        <div className='col-md-6'>
          <label className='form-label' htmlFor='follow-up-type'>Follow Up Type{required}</label>
          <select
            id='follow-up-type'
            className={selectClass('type')}
            value={form.type}
            onChange={event => update('type', event.target.value)}
          >
            <option value=''>Please Select</option>
            {options.types.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldError('type')}
        </div>
        <div className='col-12'>
          <label className='form-label' htmlFor='follow-up-remarks'>Remarks{required}</label>
          <textarea
            id='follow-up-remarks'
            className={`form-control${errors.remarks ? ' is-invalid' : ''}`}
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
                <th>Follow Up By</th>
                <th>Mode</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, index) => (
                <tr key={index}>
                  <td className='text-nowrap'>{row.date}</td>
                  <td>{row.by}</td>
                  <td>{row.mode}</td>
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

export default CandidateFollowUpModal
