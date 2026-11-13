import { useState } from 'react'
import SaveButton from '../../../../shared/components/buttons/SaveButton'
import CancelButton from '../../../../shared/components/buttons/CancelButton'
import SDLCalendar from '../../../../shared/components/calendar/SDLCalendar'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import { parseDateValue, toDateInputValue } from '../../../../shared/utils/commonUtils'

const DESCR_MAX = 100
const AD_HOC = 'A'

const EMPTY = { company: '', description: '', type: '', base: '', effectiveFrom: '', effectiveTo: '', baseDays: '', appliedFrom: '' }

const RequiredMark = () => <span className='text-danger'> *</span>

/** Last day of the period: Effective From + months - 1 day (legacy SaveAppraisal), as YYYY-MM-DD. */
const periodEnd = (from, months) => {
  const date = parseDateValue(from)
  if (!date || !months) return ''
  const end = new Date(date.getFullYear(), date.getMonth() + months, date.getDate() - 1)
  return toDateInputValue(end)
}

const fromAppraisal = appraisal =>
  appraisal
    ? {
        company: String(appraisal.company ?? ''),
        description: appraisal.description,
        type: appraisal.type,
        base: appraisal.base,
        effectiveFrom: appraisal.effectiveFrom,
        effectiveTo: appraisal.effectiveTo,
        baseDays: String(appraisal.baseDays ?? ''),
        appliedFrom: appraisal.appliedFrom
      }
    : EMPTY

/* Create Appraisal tab (legacy appraisal_setup.php tab 1). Mount with key={appraisal id} to reset. */
const AppraisalSetupForm = ({ options, appraisal, busy, onSave, onCancel }) => {
  const [form, setForm] = useState(() => fromAppraisal(appraisal))
  const [errors, setErrors] = useState({})
  const editable = !appraisal || appraisal.status === 'N'
  const isAdHoc = form.type === AD_HOC
  // Fixed types end after their period; Ad-hoc takes the date entered.
  const effectiveTo = isAdHoc ? form.effectiveTo : periodEnd(form.effectiveFrom, options.typeMonths?.[form.type])

  const set = (key, value) => {
    setForm(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: '' }))
  }
  const dateField = (key, extra = {}) => (
    <SDLCalendar
      value={parseDateValue(key === 'effectiveTo' ? effectiveTo : form[key])}
      onChange={date => set(key, date ? toDateInputValue(date) : '')}
      allowAllDates
      showHolidays={false}
      disabled={!editable || busy}
      inputClassName={errors[key] ? 'is-invalid' : ''}
      {...extra}
    />
  )
  const error = key => errors[key] && <small className='text-danger d-block mt-1'>{errors[key]}</small>

  const save = () => {
    const next = {}
    if (!form.company) next.company = 'Please select the company.'
    if (!form.description.trim()) next.description = 'Please enter the description.'
    if (!form.type) next.type = 'Please select the appraisal type.'
    if (!form.base) next.base = 'Please select the appraisal base.'
    if (!form.effectiveFrom) next.effectiveFrom = 'Please select the effective from date.'
    if (isAdHoc && !form.effectiveTo) next.effectiveTo = 'Please select the effective to date.'
    if (isAdHoc && form.effectiveTo && form.effectiveFrom && form.effectiveTo < form.effectiveFrom) {
      next.effectiveTo = 'Effective To cannot be before Effective From.'
    }
    if (!(Number(form.baseDays) > 0) || !Number.isInteger(Number(form.baseDays))) next.baseDays = 'Please enter the appraisal base days.'
    if (!form.appliedFrom) next.appliedFrom = 'Please select the appraisal applied from date.'
    setErrors(next)
    if (Object.keys(next).length) return
    onSave({
      id: appraisal?.id || '',
      company: form.company,
      description: form.description.trim(),
      type: form.type,
      base: form.base,
      effective_from: form.effectiveFrom,
      effective_to: isAdHoc ? form.effectiveTo : '',
      base_days: form.baseDays,
      applied_from: form.appliedFrom
    })
  }

  return (
    <>
      <div className='row g-3'>
        <div className='col-md-6 col-lg-3'>
          <label className='form-label'>Company<RequiredMark /></label>
          <SDLReactSelect
            value={form.company}
            options={options.companies || []}
            placeholder='Please Select'
            isDisabled={!editable || busy}
            onChange={value => set('company', value || '')}
          />
          {error('company')}
        </div>
        <div className='col-md-6 col-lg-3'>
          <label className='form-label' htmlFor='appr-descr'>Description<RequiredMark /></label>
          <input
            id='appr-descr'
            type='text'
            className={`form-control${errors.description ? ' is-invalid' : ''}`}
            maxLength={DESCR_MAX}
            value={form.description}
            disabled={!editable || busy}
            onChange={event => set('description', event.target.value)}
          />
          {error('description')}
        </div>
        <div className='col-md-6 col-lg-3'>
          <label className='form-label'>Appraisal Type<RequiredMark /></label>
          <SDLReactSelect
            value={form.type}
            options={options.types || []}
            placeholder='Please Select'
            isDisabled={!editable || busy}
            onChange={value => set('type', value || '')}
          />
          {error('type')}
        </div>
        <div className='col-md-6 col-lg-3'>
          <label className='form-label'>Appraisal Base<RequiredMark /></label>
          <SDLReactSelect
            value={form.base}
            options={options.bases || []}
            placeholder='Please Select'
            isDisabled={!editable || busy}
            onChange={value => set('base', value || '')}
          />
          {error('base')}
        </div>
        <div className='col-md-6 col-lg-3'>
          <label className='form-label'>Effective From<RequiredMark /></label>
          {dateField('effectiveFrom')}
          {error('effectiveFrom')}
        </div>
        <div className='col-md-6 col-lg-3'>
          <label className='form-label'>Effective To{isAdHoc && <RequiredMark />}</label>
          {dateField('effectiveTo', {
            disabled: !editable || busy || !isAdHoc,
            minDate: parseDateValue(form.effectiveFrom) || undefined
          })}
          {!isAdHoc && editable && <small className='text-muted d-block mt-1'>Set from the appraisal type.</small>}
          {error('effectiveTo')}
        </div>
        <div className='col-md-6 col-lg-2'>
          <label className='form-label' htmlFor='appr-days'>Appraisal Base Days<RequiredMark /></label>
          <input
            id='appr-days'
            type='number'
            min='1'
            step='1'
            className={`form-control${errors.baseDays ? ' is-invalid' : ''}`}
            value={form.baseDays}
            disabled={!editable || busy}
            onChange={event => set('baseDays', event.target.value)}
          />
          {error('baseDays')}
        </div>
        <div className='col-md-6 col-lg-2'>
          <label className='form-label'>Appraisal Applied From<RequiredMark /></label>
          {dateField('appliedFrom')}
          {error('appliedFrom')}
        </div>
        <div className='col-md-6 col-lg-2'>
          <label className='form-label' htmlFor='appr-publish'>Publish Date</label>
          <input id='appr-publish' type='text' className='form-control' value={appraisal?.publishDate || ''} disabled />
        </div>
        <div className='col-md-6 col-lg-3'>
          <label className='form-label' htmlFor='appr-close'>Close Date</label>
          <input id='appr-close' type='text' className='form-control' value={appraisal?.closeDate || ''} disabled />
        </div>
      </div>
      <div className='d-flex justify-content-center gap-2 mt-4'>
        {editable && (
          <SaveButton onClick={save} isSubmitting={busy}>
            {appraisal ? 'Update' : 'Save'}
          </SaveButton>
        )}
        <CancelButton onClick={onCancel} disabled={busy} />
      </div>
    </>
  )
}

export default AppraisalSetupForm
