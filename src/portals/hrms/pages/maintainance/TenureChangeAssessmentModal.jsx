import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import moment from 'moment'
import {
  getTenureChangeDetails,
  saveTenureChangeAssessment,
  submitTenureChangeAssessment
} from '../../services/tenureChangeService'
// import {
//   tenureRatingOptions,
//   tenureRatingQuestions,
//   tenureAssessmentPostData,
//   tenureAssessmentSubmitPostData,
//   tenureTypeOptions,
// } from "./tenureChangeOptions";
import '../../assets/css/tenureChange.css'
import SaveButton from '../../components/buttons/SaveButton'
import CancelButton from '../../components/buttons/CancelButton'

const emptyAssessment = {
  ratings: {},
  improvement: '',
  appraiserComments: '',
  employeeType: '',
  period: '',
  proposedCtc: '',
  effectiveFrom: '',
  nextAppraisalYear: '',
  remarks: ''
}

const TENURE_DATE_FORMATS = [
  moment.ISO_8601,
  'DD-MMM-YYYY',
  'DD-MMM-YY',
  'MM/DD/YYYY'
]
const MAX_PROPOSED_CTC = 10_000_000

const toTenureDateISO = value => {
  if (!value) return ''
  const parsed = moment(String(value).trim(), TENURE_DATE_FORMATS, true)
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : ''
}

const formatTenureDate = value => {
  if (!value) return '-'
  const parsed = moment(String(value).trim(), TENURE_DATE_FORMATS, true)
  return parsed.isValid() ? parsed.format('DD-MMM-YYYY') : value
}

const getEmployeeTypeValue = type =>
  type?.VALUE ?? type?.value ?? type?.ETYPE_ID ?? type

const getEmployeeTypeLabel = type =>
  type?.LABEL ?? type?.label ?? type?.EMP_TYPE ?? type

const isPermanentType = (value, options = []) => {
  const selectedOption = options.find(
    option => String(getEmployeeTypeValue(option)) === String(value)
  )
  const label = String(
    selectedOption ? getEmployeeTypeLabel(selectedOption) : value
  ).trim().toLowerCase()
  return label.includes('permanent') || ['1', 'p'].includes(label)
}

const TenureChangeAssessmentModal = ({
  config,
  show,
  record,
  onClose,
  onSuccess
}) => {
  // const modalCenterStyle = useTenureModalCenter(show);
  const [employee, setEmployee] = useState(null)
  const [assessmentMeta, setAssessmentMeta] = useState({})
  const [questions, setQuestions] = useState([])
  const [ratingOptions, setRatingOptions] = useState([])
  const [typeOptions, setTypeOptions] = useState([])
  const [assessment, setAssessment] = useState(emptyAssessment)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 })
  const [calendarMonth, setCalendarMonth] = useState(() =>
    moment().startOf('month')
  )
  const effectiveDateFieldRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [saveSucceeded, setSaveSucceeded] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

  useEffect(() => {
    if (!show || !record) return undefined

    let active = true
    const loadDetails = async () => {
      setLoading(true)
      setLoadError('')
      setEmployee(null)
      setQuestions([])
      setRatingOptions([])
      setTypeOptions([])
      setAssessment(emptyAssessment)
      setCalendarOpen(false)
      setCalendarMonth(moment().startOf('month'))
      setAssessmentMeta({})
      setSaveSucceeded(false)
      setActionMessage('')

      try {
        console.log(record.TRAN_CODE, record.TASK_ID, record.ID)

        const response = await getTenureChangeDetails({
          empCode: record.TRAN_CODE,
          taskId: record.TASK_ID,
          tenureChangeId: record.ID
        })

        const payload =
          response?.data?.data ??
          response?.data ??
          response?.response?.data ??
          {}
        if (
          !(
            response?.status === true ||
            response?.success === true ||
            payload?.employee
          )
        ) {
          throw new Error(
            response?.message || 'Tenure details could not be loaded.'
          )
        }

        const emp = payload.employee ?? {}
        const meta = payload.tenure_assessment ?? {}
        const questionList = Array.isArray(payload.questions)
          ? payload.questions
          : []
        const empTypes = Array.isArray(payload.employee_type_options)
          ? payload.employee_type_options
          : []

        const normalizedQuestions = questionList.map((q, index) => ({
          ...q,
          id: q.id ?? q.QUESTION_ID ?? index,
          question: q.question ?? q.QUESTION ?? `Question ${index + 1}`,
          group: q.group ?? 'GENERAL',
          subgroup: q.subgroup ?? 'PERSONAL',
          options: Array.isArray(q.options) ? q.options : [],
          saved_answer: q.saved_answer ?? ''
        }))

        const firstOptions =
          normalizedQuestions.find(q => q.options.length)?.options ?? []
        const normalizedEmployee = {
          code: emp.emp_code ?? record.TRAN_CODE ?? '-',
          name: emp.name ?? '-',
          dateOfJoining: formatTenureDate(emp.doj),
          designation: emp.designation ?? '-',
          department: emp.department ?? '-',
          employeeType: emp.current_emp_type ?? '-',
          tenureDueDate: formatTenureDate(emp.tenure_due_date),
          currentCtc: emp.current_ctc ?? ''
        }

        const ratings = {}
        normalizedQuestions.forEach(q => {
          if (q.saved_answer) ratings[q.id] = q.saved_answer
        })

        if (!active) return
        setEmployee(normalizedEmployee)
        setAssessmentMeta(meta)
        setQuestions(normalizedQuestions)
        setRatingOptions(firstOptions)
        setTypeOptions(empTypes)
        setAssessment({
          ...emptyAssessment,
          ratings,
          employeeType: String(meta.etype_id ?? ''),
          period: isPermanentType(meta.etype_id, empTypes)
            ? ''
            : meta.etype_period ?? '',
          proposedCtc: meta.proposed_ctc ?? '',
          effectiveFrom: toTenureDateISO(meta.effective_from),
          remarks: meta.remarks ?? ''
        })
      } catch (error) {
        if (active)
          setLoadError(error?.message || 'Tenure details could not be loaded.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDetails()
    return () => {
      active = false
    }
  }, [show, record?.TRAN_CODE, record?.TASK_ID, record?.ID])

  const updateAssessment = (field, value) => {
    setAssessment(current => ({ ...current, [field]: value }))
    setSaveSucceeded(false)
    setActionMessage('')
  }

  const updateRating = (questionId, value) => {
    setAssessment(current => ({
      ...current,
      ratings: { ...current.ratings, [questionId]: value }
    }))
    setSaveSucceeded(false)
    setActionMessage('')
  }

  const postData = useMemo(
    () => ({
      emp_code: employee?.code ?? record?.TRAN_CODE ?? '',
      task_id: record?.TASK_ID ?? assessmentMeta.task_id ?? '',
      tenure_change_id: assessmentMeta.tenure_change_id ?? record?.ID ?? null,
      jd_id: assessmentMeta.jd_id ?? null,
      etype_id: assessment.employeeType,
      etype_period: isPermanentType(assessment.employeeType, typeOptions)
        ? ''
        : assessment.period,
      proposed_ctc: assessment.proposedCtc,
      effective_from: assessment.effectiveFrom,
      next_appraisal_year: assessment.nextAppraisalYear,
      remarks: assessment.remarks,
      answers: questions.map(q => ({
        ques_id: q.id,
        answer: assessment.ratings[q.id] ?? ''
      })),
      improvement: assessment.improvement,
      appraiser_comments: assessment.appraiserComments
    }),
    [employee, record, assessmentMeta, assessment, questions, typeOptions]
  )

  const assessmentComplete =
    questions.every(q => Boolean(assessment.ratings[q.id])) &&
    Boolean(assessment.employeeType)
  const canSubmit =
    saveSucceeded &&
    assessmentComplete &&
    Boolean(assessmentMeta.tenure_change_id ?? record?.ID)

  const effectiveDateMinimum = (() => {
    const currentMonthStart = moment().startOf('month')
    const configuredMinimum = toTenureDateISO(
      assessmentMeta.min_effective_date
    )
    return configuredMinimum
      ? moment.max(
          currentMonthStart,
          moment(configuredMinimum, 'YYYY-MM-DD', true)
        )
      : currentMonthStart
  })()

  const isValidEffectiveDate = value => {
    const date = moment(value, 'YYYY-MM-DD', true)
    return (
      date.isValid() &&
      date.date() === 1 &&
      !date.isBefore(effectiveDateMinimum, 'day')
    )
  }

  const calendarGridStart = calendarMonth
    .clone()
    .startOf('month')
    .startOf('week')
  const calendarDays = Array.from({ length: 42 }, (_, index) =>
    calendarGridStart.clone().add(index, 'days')
  )
  const calendarMinimumMonth = effectiveDateMinimum.clone().startOf('month')
  const proposedCtcHasFraction =
    assessment.proposedCtc !== '' &&
    assessment.proposedCtc !== null &&
    !Number.isInteger(Number(assessment.proposedCtc))
  const proposedCtcExceedsLimit =
    assessment.proposedCtc !== '' &&
    assessment.proposedCtc !== null &&
    Number(assessment.proposedCtc) > MAX_PROPOSED_CTC

  const handleSave = async event => {
    event.preventDefault()
    if (!employee || saving) return
    if (proposedCtcHasFraction || proposedCtcExceedsLimit) return
    if (!isValidEffectiveDate(assessment.effectiveFrom)) {
      setActionMessage(
        'Effective From must be the 1st of a month and cannot be earlier than the allowed date.'
      )
      return
    }
    setSaving(true)
    setSaveSucceeded(false)
    setActionMessage('')
    try {
      const response = await saveTenureChangeAssessment(postData)
      if (response?.status === true || response?.success === true) {
        setSaveSucceeded(true)
        setActionMessage(response?.message || 'Assessment saved.')
        //onSuccess?.();
      } else {
        setActionMessage(response?.message || 'Assessment could not be saved.')
      }
    } catch (error) {
      setActionMessage(error?.message || 'Assessment could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return
    if (proposedCtcHasFraction || proposedCtcExceedsLimit) return
    if (!isValidEffectiveDate(assessment.effectiveFrom)) {
      setActionMessage(
        'Effective From must be the 1st of a month and cannot be earlier than the allowed date.'
      )
      return
    }
    setSubmitting(true)
    setActionMessage('')
    try {
      const response = await submitTenureChangeAssessment(postData)
      if (response?.status === true || response?.success === true) {
        setActionMessage(response?.message || 'Assessment submitted.')
        onSuccess?.()
        onClose()
      } else {
        setActionMessage(
          response?.message || 'Assessment could not be submitted.'
        )
      }
    } catch (error) {
      setActionMessage(error?.message || 'Assessment could not be submitted.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!show || !record) return null

  const optionValue = getEmployeeTypeValue
  const optionLabel = getEmployeeTypeLabel
  const isPermanentEmployeeType = isPermanentType(
    assessment.employeeType,
    typeOptions
  )

  return (
    <div
      className='modal fade show d-block tenure-modal-backdrop'
      tabIndex='-1'
      role='dialog'
      aria-modal='true'
      aria-labelledby='tenure-assessment-title'
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div
        className='modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable'
        style={{ width: '92%', maxWidth: '1200px' }}
      >
        <form
          className='modal-content shadow-lg border-0'
          onSubmit={handleSave}
        >
          <div className='modal-header'>
            <div>
              <h5 className='modal-title mb-1' id='tenure-assessment-title'>
                {config?.title || 'Employee Tenure Change'}
              </h5>
              <small className='text-muted'>
                Employee Code: <strong>{record.TRAN_CODE || '-'}</strong>
                <span className='mx-2'>|</span>
                Task ID: <strong>{record.ID || '-'}</strong>
                <span className='mx-2'>|</span>
                Workflow Task: <strong>{record.TASK_ID || '-'}</strong>
              </small>
            </div>
            <button
              type='button'
              className='close'
              onClick={onClose}
              aria-label='Close'
            >
              <span aria-hidden='true'>&times;</span>
            </button>
          </div>

          <div className='modal-body' onScroll={() => setCalendarOpen(false)}>
            {loading ? (
              <div className='text-center py-5'>
                <span
                  className='spinner-border'
                  role='status'
                  aria-label='Loading'
                />
                <div className='mt-2'>Loading tenure assessment...</div>
              </div>
            ) : loadError ? (
              <div className='alert alert-warning mb-0' role='alert'>
                {loadError}
              </div>
            ) : employee ? (
              <div className='tenure-change-page'>
                <div className='row g-3 mb-0 tenure-employee-summary'>
                  <div className='col-lg-4'>
                    <div>
                      <strong>Employee:</strong> {employee.code} -{' '}
                      {employee.name}
                    </div>
                    <div>
                      <strong>Current Employee Type:</strong>{' '}
                      {employee.employeeType}
                    </div>
                  </div>
                  <div className='col-lg-4'>
                    <div>
                      <strong>Date of Joining:</strong> {employee.dateOfJoining}
                    </div>
                    <div>
                      <strong>Department:</strong> {employee.department}
                    </div>
                  </div>
                  <div className='col-lg-4'>
                    <div>
                      <strong>Tenure Due Date:</strong> {employee.tenureDueDate}
                    </div>
                  </div>
                </div>
                <div className='row mt-1 mb-3 tenure-employee-designation'>
                    <div className='col-12'>
                      <strong>Designation:</strong> {employee.designation}
                    </div>
                </div>

                {questions.length === 0 ? (
                  <div className='alert alert-info'>
                    No tenure assessment questions are configured for this
                    employee.
                  </div>
                ) : (
                  <>
                    <div className='table-responsive tenure-rating-table-wrap'>
                      <table className='table table-bordered tenure-rating-table mb-0'>
                        <tbody>
                          <tr className='tenure-rating-section-row'>
                            <th colSpan='2'>GENERAL</th>
                          </tr>
                          <tr className='tenure-rating-section-row tenure-rating-subgroup-row'>
                            <th colSpan='2'>
                              {questions[0]?.subgroup || 'PERSONAL'}
                            </th>
                          </tr>
                          {questions.map((question, index) => {
                            const isCommentQuestion =
                              /area of improvement|appraiser.?s comments/i.test(
                                question.question
                              )

                            return (
                              <tr key={question.id}>
                                <th className='tenure-rating-question'>
                                  {index + 1}) {question.question}
                                </th>
                                <td>
                                  {isCommentQuestion ? (
                                    <textarea
                                      className='form-control tenure-rating-answer'
                                      rows='4'
                                      value={
                                        assessment.ratings[question.id] ??
                                        question.saved_answer ??
                                        ''
                                      }
                                      onChange={event =>
                                        updateRating(
                                          question.id,
                                          event.target.value
                                        )
                                      }
                                    />
                                  ) : question.input_type === 'checkbox' ? (
                                  <div className='tenure-rating-options'>
                                    {question.options.map(option => {
                                      const selected = String(
                                        assessment.ratings[question.id] ?? ''
                                      )
                                        .split(',')
                                        .map(v => v.trim())
                                        .includes(option)
                                      return (
                                        <label
                                          key={option}
                                          className='form-check form-check-inline'
                                        >
                                          <input
                                            className='form-check-input'
                                            type='checkbox'
                                            checked={selected}
                                            onChange={event => {
                                              const current = String(
                                                assessment.ratings[
                                                  question.id
                                                ] ?? ''
                                              )
                                                .split(',')
                                                .map(v => v.trim())
                                                .filter(Boolean)
                                              const next = event.target.checked
                                                ? [...current, option]
                                                : current.filter(
                                                    v => v !== option
                                                  )
                                              updateRating(
                                                question.id,
                                                next.join(',')
                                              )
                                            }}
                                          />
                                          <span className='form-check-label'>
                                            {option}
                                          </span>
                                        </label>
                                      )
                                    })}
                                  </div>
                                ) : question.input_type === 'radio' ||
                                  question.rating_type === 'R' ? (
                                  <div className='tenure-rating-options'>
                                    {(question.options.length
                                      ? question.options
                                      : ratingOptions
                                    ).map(option => (
                                      <label
                                        key={option}
                                        className='form-check form-check-inline'
                                      >
                                        <input
                                          className='form-check-input'
                                          type='radio'
                                          name={`rating-${question.id}`}
                                          value={option}
                                          checked={
                                            assessment.ratings[question.id] ===
                                            option
                                          }
                                          onChange={() =>
                                            updateRating(question.id, option)
                                          }
                                        />
                                        <span className='form-check-label'>
                                          {option}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                ) : (
                                    <textarea
                                      className='form-control tenure-rating-answer'
                                      rows='4'
                                      value={
                                        assessment.ratings[question.id] ??
                                        question.saved_answer ??
                                        ''
                                      }
                                      onChange={event =>
                                        updateRating(
                                          question.id,
                                          event.target.value
                                        )
                                      }
                                    />
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {questions.length > 0 && (
                  <div className='row g-3 mt-2'>
                    <div className='col-lg-4 col-md-6'>
                      <label className='form-label'>
                        Employee Type <span className='text-danger'>*</span>
                      </label>
                      <select
                        className='form-select tenure-change-select'
                        value={assessment.employeeType}
                        onChange={event => {
                          const value = event.target.value
                          setAssessment(current => ({
                            ...current,
                            employeeType: value,
                            period: isPermanentType(value, typeOptions)
                              ? ''
                              : current.period
                          }))
                          setSaveSucceeded(false)
                          setActionMessage('')
                        }}
                      >
                        <option value=''>Select Employee Type</option>
                        {typeOptions.map((type, index) => (
                          <option
                            key={optionValue(type) ?? index}
                            value={optionValue(type)}
                          >
                            {optionLabel(type)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className='col-lg-4 col-md-6'>
                      <label className='form-label'>Period (In Months)</label>
                      <input
                        className='form-control'
                        type='number'
                        min='0'
                        value={isPermanentEmployeeType ? '' : assessment.period}
                        disabled={isPermanentEmployeeType}
                        onChange={event =>
                          updateAssessment('period', event.target.value)
                        }
                      />
                    </div>
                    <div className='col-lg-4 col-md-6'>
                      <label className='form-label'>Current CTC</label>
                      <input
                        className='form-control'
                        value={employee.currentCtc || '-'}
                        disabled
                      />
                    </div>
                    <div className='col-lg-4 col-md-6'>
                      <label className='form-label'>
                        Proposed CTC <small className='text-muted'>(in lakhs e.g. 30000)</small>
                      </label>
                      <input
                        className={`form-control${proposedCtcHasFraction || proposedCtcExceedsLimit ? ' is-invalid' : ''}`}
                        type='number'
                        min='0'
                        max={MAX_PROPOSED_CTC}
                        step='any'
                        placeholder='Enter proposed CTC'
                        value={assessment.proposedCtc}
                        onChange={event =>
                          updateAssessment('proposedCtc', event.target.value)
                        }
                        aria-invalid={proposedCtcHasFraction || proposedCtcExceedsLimit}
                      />
                      {proposedCtcHasFraction && (
                        <small className='text-danger d-block mt-1'>
                          Proposed CTC must be a whole number.
                        </small>
                      )}
                      {proposedCtcExceedsLimit && (
                        <small className='text-danger d-block mt-1'>
                          Proposed CTC cannot exceed 1 crore (10,000,000).
                        </small>
                      )}
                    </div>
                    <div
                      ref={effectiveDateFieldRef}
                      className='col-lg-4 col-md-6 tenure-effective-date-field'
                    >
                      <label className='form-label'>
                        Effective From <span className='text-danger'>*</span>{' '}
                        <small className='text-muted'>(1st of every month)</small>
                      </label>
                      <div className='input-group tenure-effective-date-wrap'>
                        <input
                          className='form-control'
                          type='text'
                          value={
                            assessment.effectiveFrom
                              ? formatTenureDate(assessment.effectiveFrom)
                              : ''
                          }
                          placeholder='DD-Mon-YYYY'
                          readOnly
                          style={{
                            border: '1px solid #6c757d',
                            borderRight: 0,
                            borderRadius: '0.375rem 0 0 0.375rem',
                            boxShadow: 'none'
                          }}
                        />
                        <button
                          type='button'
                          className='input-group-text position-relative'
                          aria-label='Choose effective date'
                          onClick={() => {
                            const fieldRect = effectiveDateFieldRef.current?.getBoundingClientRect()
                            if (fieldRect) {
                              const calendarHeight = 300
                              setCalendarPosition({
                                top:
                                  fieldRect.bottom + calendarHeight + 4 >
                                  window.innerHeight
                                    ? Math.max(8, fieldRect.top - calendarHeight - 4)
                                    : fieldRect.bottom + 4,
                                left: Math.max(
                                  8,
                                  Math.min(
                                    fieldRect.right - 280,
                                    window.innerWidth - 288
                                  )
                                )
                              })
                            }
                            const selectedDate = moment(
                              toTenureDateISO(assessment.effectiveFrom) ||
                                effectiveDateMinimum.format('YYYY-MM-DD'),
                              'YYYY-MM-DD',
                              true
                            )
                            setCalendarMonth(
                              moment
                                .max(selectedDate, effectiveDateMinimum)
                                .startOf('month')
                            )
                            setCalendarOpen(current => !current)
                          }}
                          style={{
                            border: '1px solid #6c757d',
                            borderLeft: 0,
                            borderRadius: '0 0.375rem 0.375rem 0',
                            backgroundColor: '#fff',
                            color: '#6c757d'
                          }}
                        >
                          <i className='ti ti-calendar' />
                        </button>
                      </div>
                      {calendarOpen && createPortal(
                        <div
                          className='tenure-date-calendar'
                          style={{
                            top: `${calendarPosition.top}px`,
                            left: `${Math.max(8, calendarPosition.left)}px`
                          }}
                        >
                          <div className='tenure-date-calendar-header'>
                            <button
                              type='button'
                              aria-label='Previous month'
                              disabled={
                                !calendarMonth
                                  .clone()
                                  .subtract(1, 'month')
                                  .isSameOrAfter(calendarMinimumMonth, 'month')
                              }
                              onClick={() =>
                                setCalendarMonth(current =>
                                  current.clone().subtract(1, 'month')
                                )
                              }
                            >
                              <i className='ti ti-chevron-left' />
                            </button>
                            <strong>{calendarMonth.format('MMMM YYYY')}</strong>
                            <button
                              type='button'
                              aria-label='Next month'
                              onClick={() =>
                                setCalendarMonth(current =>
                                  current.clone().add(1, 'month')
                                )
                              }
                            >
                              <i className='ti ti-chevron-right' />
                            </button>
                          </div>
                          <div className='tenure-date-calendar-grid tenure-date-calendar-weekdays'>
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(
                              day => <span key={day}>{day}</span>
                            )}
                          </div>
                          <div className='tenure-date-calendar-grid'>
                            {calendarDays.map(day => {
                              const isCurrentMonth = day.month() === calendarMonth.month()
                              const isAllowed =
                                isCurrentMonth &&
                                day.date() === 1 &&
                                !day.isBefore(effectiveDateMinimum, 'day')
                              const isSelected =
                                day.format('YYYY-MM-DD') ===
                                toTenureDateISO(assessment.effectiveFrom)

                              return (
                                <button
                                  key={day.format('YYYY-MM-DD')}
                                  type='button'
                                  disabled={!isAllowed}
                                  className={isSelected ? 'selected' : ''}
                                  aria-label={day.format('DD-MMM-YYYY')}
                                  title={
                                    isAllowed
                                      ? day.format('DD-MMM-YYYY')
                                      : 'Only the 1st of an allowed month can be selected'
                                  }
                                  onClick={() => {
                                    updateAssessment(
                                      'effectiveFrom',
                                      day.format('YYYY-MM-DD')
                                    )
                                    setCalendarOpen(false)
                                  }}
                                >
                                  {day.date()}
                                </button>
                              )
                            })}
                          </div>
                        </div>,
                        document.body
                      )}
                    </div>
                    <div className='col-lg-4 col-md-6'>
                      <label className='form-label'>Next Appraisal Year</label>
                      <select
                        className='form-select tenure-change-select'
                        value={assessment.nextAppraisalYear}
                        onChange={event =>
                          updateAssessment(
                            'nextAppraisalYear',
                            event.target.value
                          )
                        }
                      >
                        <option value=''>Select Year</option>
                        {[2027, 2028, 2029, 2030, 2031].map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className='col-12'>
                      <label className='form-label'>Assessment Remarks</label>
                      <textarea
                        className='form-control'
                        rows='2'
                        value={assessment.remarks}
                        onChange={event =>
                          updateAssessment('remarks', event.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className='alert alert-warning mb-0' role='alert'>
                Employee details are not available for this request.
              </div>
            )}
          </div>

          {questions.length > 0 && (
            <div className='modal-footer'>
              {actionMessage && (
                <span className='small text-muted me-auto' role='status'>
                  {actionMessage}
                </span>
              )}
              <SaveButton
                type='submit'
                disabled={loading || !employee || saving || submitting}
                isSubmitting={saving}
                className='me-2'
              >
                Save
              </SaveButton>
              {canSubmit && (
                <button
                  type='button'
                  className='btn btn-warning'
                  onClick={handleSubmit}
                  disabled={submitting || saving}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              )}
              <CancelButton onClick={onClose} disabled={saving || submitting} />
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default TenureChangeAssessmentModal
