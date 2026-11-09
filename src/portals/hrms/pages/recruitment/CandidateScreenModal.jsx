import { useEffect, useState } from 'react'
import RecruitmentModal from './RecruitmentModal'
import SaveButton from '../../../../shared/components/buttons/SaveButton'
import { formatDate } from '../../../../shared/utils/commonUtils'
import { notifySuccess } from '../../../../shared/services/alertService'
import { REMARK_MAX_LENGTH } from './recruitmentOptions'
import { getScreenRemark, saveScreenRemark } from '../../services/recruitmentService'

const EMPTY = { expectedSalary: '', currentAge: '', relevantExperience: '', qualification: '', screenRemark: '' }
const REQUIRED = {
  expectedSalary: 'Expected salary is required.',
  currentAge: 'Current age is required.',
  relevantExperience: 'Relevant experience is required.',
  qualification: 'Current qualification is required.',
  screenRemark: 'Screen remarks are required.'
}
const NUMERIC = ['expectedSalary', 'currentAge', 'relevantExperience']

/* Add Screen Remarks / Mark As Verified (legacy candidate_info_sv.php?showData). Read-only once saved. */
const CandidateScreenModal = ({ candidate, onClose, onSaved }) => {
  const [form, setForm] = useState(EMPTY)
  const [qualifications, setQualifications] = useState([])
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    getScreenRemark(candidate.id)
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        if (!active) return
        setQualifications(response.data.qualifications || [])
        if (response.data.remark) {
          setForm({ ...EMPTY, ...response.data.remark })
          setVerified(true)
        }
      })
      .catch(error => {
        if (active) setLoadError(error?.message || 'Unable to load the screen remarks.')
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
    Object.entries(REQUIRED).forEach(([field, message]) => {
      if (!String(form[field]).trim()) next[field] = message
    })
    NUMERIC.forEach(field => {
      if (!next[field] && !/^\d+$/.test(form[field].trim())) next[field] = 'Please enter a number only.'
    })
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    setSaveError('')
    try {
      const response = await saveScreenRemark({
        can_id: candidate.id,
        expected_salary: form.expectedSalary.trim(),
        current_age: form.currentAge.trim(),
        relevant_experience: form.relevantExperience.trim(),
        qualification: form.qualification,
        screen_remark: form.screenRemark.trim()
      })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      onSaved()
    } catch (error) {
      setSaveError(error?.message || 'Unable to save the screen remarks.')
    } finally {
      setSaving(false)
    }
  }

  const fieldClass = field => `form-control${errors[field] ? ' is-invalid' : ''}`
  const fieldError = field =>
    errors[field] && <small className='text-danger d-block mt-1'>{errors[field]}</small>
  const required = <span className='text-danger'> *</span>

  return (
    <RecruitmentModal
      titleId='screen-remarks-title'
      title='Add Screen Remarks'
      loading={loading}
      loadError={loadError}
      onClose={onClose}
      footer={
        !verified && (
          <SaveButton onClick={save} isSubmitting={saving}>
            Mark As Verified
          </SaveButton>
        )
      }
    >
      <div className='d-flex justify-content-between flex-wrap gap-2 mb-3'>
        <strong>Candidate Name: {candidate.name}</strong>
        <strong>Date: {formatDate(new Date())}</strong>
      </div>
      {verified && <div className='alert alert-info py-2'>This candidate has already been verified.</div>}
      {saveError && <div className='alert alert-danger py-2'>{saveError}</div>}
      <div className='row g-3'>
        <div className='col-md-6'>
          <label className='form-label' htmlFor='screen-salary'>Expected Salary{required}</label>
          <input
            id='screen-salary'
            className={fieldClass('expectedSalary')}
            placeholder='In Rupees'
            inputMode='numeric'
            maxLength={12}
            disabled={verified}
            value={form.expectedSalary}
            onChange={event => update('expectedSalary', event.target.value)}
          />
          {fieldError('expectedSalary')}
        </div>
        <div className='col-md-6'>
          <label className='form-label' htmlFor='screen-age'>Current Age{required}</label>
          <input
            id='screen-age'
            className={fieldClass('currentAge')}
            placeholder='In Years'
            inputMode='numeric'
            maxLength={2}
            disabled={verified}
            value={form.currentAge}
            onChange={event => update('currentAge', event.target.value)}
          />
          {fieldError('currentAge')}
        </div>
        <div className='col-md-6'>
          <label className='form-label' htmlFor='screen-experience'>Relevant Experience{required}</label>
          <input
            id='screen-experience'
            className={fieldClass('relevantExperience')}
            placeholder='In Years'
            inputMode='numeric'
            maxLength={2}
            disabled={verified}
            value={form.relevantExperience}
            onChange={event => update('relevantExperience', event.target.value)}
          />
          {fieldError('relevantExperience')}
        </div>
        <div className='col-md-6'>
          <label className='form-label' htmlFor='screen-qualification'>Current Qualification{required}</label>
          <select
            id='screen-qualification'
            className={`form-select tenure-change-select${errors.qualification ? ' is-invalid' : ''}`}
            disabled={verified}
            value={form.qualification}
            onChange={event => update('qualification', event.target.value)}
          >
            <option value=''>Please Select</option>
            {qualifications.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldError('qualification')}
        </div>
        <div className='col-12'>
          <label className='form-label' htmlFor='screen-remark'>Screen Remarks{required}</label>
          <textarea
            id='screen-remark'
            className={fieldClass('screenRemark')}
            rows={3}
            maxLength={REMARK_MAX_LENGTH}
            disabled={verified}
            value={form.screenRemark}
            onChange={event => update('screenRemark', event.target.value)}
          />
          {fieldError('screenRemark')}
        </div>
      </div>
    </RecruitmentModal>
  )
}

export default CandidateScreenModal
