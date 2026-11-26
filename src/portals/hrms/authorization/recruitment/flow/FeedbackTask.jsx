import { useMemo, useState } from 'react'
import Badge from '../../../../../shared/components/Badge'
import SDLCalendar from '../../../../../shared/components/calendar/SDLCalendar'
import SDLReactSelect from '../../../../../shared/components/form/SDLReactSelect'
import { parseDateValue, toDateInputValue } from '../../../../../shared/utils/commonUtils'
import SDLTabsComponent from '../../../components/tabs/SDLTabsComponent'
import RecruitmentModal from '../../../pages/recruitment/RecruitmentModal'
import SaveButton from '../../../../../shared/components/buttons/SaveButton'
import { ActionError, Detail, FlowSummary } from './flowShared'
import { useFlowTask } from './useFlowTask'

const TASK_INTERVIEWER = 9
const ANSWER_MAX = 1000
const REMARK_MAX = 200

/** Rows grouped under their heading, keeping order. */
const groupRows = rows => {
  const groups = []
  rows.forEach(row => {
    const last = groups[groups.length - 1]
    if (last && last.name === row.group) last.rows.push(row)
    else groups.push({ name: row.group, rows: [row] })
  })
  return groups
}

const QuestionInput = ({ question, value, onChange, disabled }) => {
  if (question.type === 'T') {
    return (
      <input name="answer"
        type='text'
        className='form-control form-control-sm'
        aria-label={question.question}
        maxLength={ANSWER_MAX}
        value={value || ''}
        disabled={disabled}
        onChange={event => onChange(event.target.value)}
      />
    )
  }
  const multiple = question.type === 'C'
  const chosen = multiple ? (Array.isArray(value) ? value : []) : value
  return question.options.map((option, index) => {
    const id = `q-${question.id}-${index}`
    return (
      <div className='form-check form-check-inline' key={id}>
        <input
          className='form-check-input'
          type={multiple ? 'checkbox' : 'radio'}
          name={`q-${question.id}`}
          id={id}
          checked={multiple ? chosen.includes(option) : chosen === option}
          disabled={disabled}
          onChange={() =>
            onChange(multiple ? (chosen.includes(option) ? chosen.filter(item => item !== option) : [...chosen, option]) : option)
          }
        />
        <label className='form-check-label' htmlFor={id}>
          {option}
        </label>
      </div>
    )
  })
}

/** "PERSONAL TRAITS" -> "Personal Traits" for the section headings. */
const titleCase = text => String(text || '').toLowerCase().replace(/(^|[\s(/-])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase())

/** "SNEHA AMBREESH GUPTA (01996)" -> "Sneha Ambreesh Gupta". */
const personName = name => titleCase(String(name || '').replace(/\s*\([^)]*\)\s*$/, ''))

const RESULT_TAGS = { P: 'bg-success', F: 'bg-danger' }

/** Who interviewed the candidate, and each interviewer's Pass / Fail and capability points, for the recommender. */
const PanelSummary = ({ panel }) => {
  const people = panel?.interviewers || []
  if (people.length === 0) return null
  const pointsKey = (panel.levelScores || []).map(level => `${level.label}: ${level.score}`).join(', ')
  return (
    <>
      <Detail label='Interview by' value={people.map(person => personName(person.name)).join(', ')} />
      {people.map(person => (
        <div className='col-12 d-flex flex-wrap align-items-center column-gap-4 row-gap-1' key={person.code}>
          <div className='d-flex align-items-center gap-2'>
            <span className='form-label mb-0'>Result by {personName(person.name)}:</span>
            <Badge text={person.resultText || 'Pending'} className={RESULT_TAGS[person.result] || 'bg-secondary'} />
          </div>
          <div className='d-flex align-items-center gap-2'>
            <span className='form-label mb-0'>Points:</span>
            <span>
              {person.score} / {panel.expectedScore}
              {pointsKey && <span className='text-muted ms-1'>({pointsKey})</span>}
            </span>
          </div>
        </div>
      ))}
    </>
  )
}

/** Questions and capabilities still unanswered (all are required to submit). */
const missingFeedback = (details, form) => {
  const answered = value => (Array.isArray(value) ? value.length > 0 : String(value ?? '').trim() !== '')
  return {
    questions: new Set(details.questions.filter(q => !answered(form.answers[q.id])).map(q => q.id)),
    remarks: new Set(details.questions.filter(q => !answered(form.answerRemarks[q.id])).map(q => q.id)),
    capabilities: new Set(details.capabilities.filter(c => !answered(form.levels[c.id])).map(c => c.id))
  }
}

const RequiredMark = () => <span className='text-danger'> *</span>

/* Interview Session (9). Legacy session_int.php. */
const InterviewerForm = ({ details, form, setForm, busy, tab, setTab, missing }) => {
  const questionGroups = useMemo(() => groupRows(details.questions), [details.questions])
  const capabilityGroups = useMemo(() => groupRows(details.capabilities), [details.capabilities])
  const set = (key, id, value) => setForm(current => ({ ...current, [key]: { ...current[key], [id]: value } }))

  return (
    <SDLTabsComponent
      tabs={[
        { key: 'questions', label: 'Interview Questions' },
        { key: 'capabilities', label: 'Capabilities' },
        { key: 'result', label: 'Final Result' }
      ]}
      selectedTab={tab}
      onTabChange={setTab}
    >
      {tab === 'questions' && (
        <div>
          {details.questions.length === 0 && <div className='alert alert-warning'>No interview questions are set for this job description.</div>}
          {/* Fixed layout so long questions wrap and the table never scrolls sideways. */}
          <table className='table table-bordered table-sm align-middle mb-0 recruitment-flow-table recruitment-questions-table'>
            <colgroup>
              <col style={{ width: '45%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '35%' }} />
            </colgroup>
            <tbody>
              {questionGroups.map(group => [
                group.name && (
                  <tr key={`g-${group.name}`}>
                    <th colSpan={3} className='recruitment-group-heading'>
                      {titleCase(group.name)}
                    </th>
                  </tr>
                ),
                ...group.rows.map((question, index) => (
                  <tr key={question.id}>
                    <td className={`fw-semibold${missing?.questions.has(question.id) ? ' text-danger' : ''}`}>
                      {index + 1}) {question.question}
                      <RequiredMark />
                    </td>
                    <td className={missing?.questions.has(question.id) ? 'recruitment-missing-cell' : ''}>
                      <QuestionInput
                        question={question}
                        value={form.answers[question.id]}
                        disabled={busy}
                        onChange={value => set('answers', question.id, value)}
                      />
                    </td>
                    <td>
                      <textarea name="answerRemarks"
                        className={`form-control form-control-sm${missing?.remarks.has(question.id) ? ' is-invalid' : ''}`}
                        rows={2}
                        placeholder='Remarks *'
                        aria-label={`Remarks for ${question.question}`}
                        maxLength={ANSWER_MAX}
                        value={form.answerRemarks[question.id] || ''}
                        disabled={busy}
                        onChange={event => set('answerRemarks', question.id, event.target.value)}
                      />
                    </td>
                  </tr>
                ))
              ])}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'capabilities' && (
        <div className='table-responsive'>
          {details.capabilities.length === 0 && <div className='alert alert-warning'>No capabilities are set for this job description.</div>}
          <table className='table table-bordered table-sm align-middle mb-0 recruitment-flow-table'>
            <tbody>
              {capabilityGroups.map(group => [
                <tr key={`g-${group.name}`}>
                  <th colSpan={2} className='recruitment-group-heading'>
                    {titleCase(group.name)}
                  </th>
                </tr>,
                ...group.rows.map((capability, index) => (
                  <tr key={capability.id}>
                    <td style={{ width: '60%' }} className={`fw-semibold${missing?.capabilities.has(capability.id) ? ' text-danger' : ''}`}>
                      {index + 1}) {capability.description}
                      <RequiredMark />
                    </td>
                    <td>
                      <SDLReactSelect
                        value={form.levels[capability.id] || ''}
                        options={details.levels}
                        placeholder='Please Select'
                        isDisabled={busy}
                        hasError={Boolean(missing?.capabilities.has(capability.id))}
                        onChange={value => set('levels', capability.id, value || '')}
                      />
                    </td>
                  </tr>
                ))
              ])}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'result' && (
        <div className='row g-3'>
          <div className='col-md-3'>
            <label className='form-label'>
              Result <span className='text-danger'>*</span>
            </label>
            <SDLReactSelect
              value={form.result}
              options={details.results}
              placeholder='Please Select'
              isDisabled={busy}
              onChange={value => setForm(current => ({ ...current, result: value || '' }))}
            />
          </div>
          <div className='col-md-9'>
            <label className='form-label' htmlFor='intrv-remarks'>
              Remarks
            </label>
            <input
              id='intrv-remarks'
              type='text'
              className='form-control'
              maxLength={REMARK_MAX}
              value={form.remarks}
              disabled={busy}
              onChange={event => setForm(current => ({ ...current, remarks: event.target.value }))}
            />
          </div>
        </div>
      )}
    </SDLTabsComponent>
  )
}

/* Every interviewer's answers and capability levels (legacy "View Results"). */
const PanelResults = ({ panel }) => {
  if (panel.interviewers.length === 0) return null
  // Answers and levels are short, so the text column takes what the interviewer columns don't need.
  const count = panel.interviewers.length
  const questionWidth = `${Math.max(40, 100 - 25 * count)}%`
  const skillWidth = `${Math.max(30, 85 - 20 * count)}%`
  return (
    <>
      <h6 className='mt-3'>Comparison of the Feedback</h6>
      {/* Fixed layout: long questions wrap, no sideways scrolling. */}
      <div>
        <table className='table table-bordered table-sm mb-3 recruitment-flow-table recruitment-questions-table'>
          <thead>
            <tr>
              <th style={{ width: questionWidth }}>Question</th>
              {panel.interviewers.map(person => (
                <th key={person.code}>
                  {person.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {panel.questions.map((question, index) => (
              <tr key={question.id}>
                <td>
                  {index + 1}) {question.question}
                </td>
                {panel.interviewers.map(person => (
                  <td key={person.code}>{person.answers[question.id] || '-'}</td>
                ))}
              </tr>
            ))}
            <tr>
              <td className='fw-semibold'>Remarks</td>
              {panel.interviewers.map(person => (
                <td key={person.code}>{person.remarks || '-'}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <table className='table table-bordered table-sm mb-0 recruitment-flow-table recruitment-questions-table'>
          <thead>
            <tr>
              <th style={{ width: skillWidth }}>Skill</th>
              <th style={{ width: '15%' }}>Expected Level</th>
              {panel.interviewers.map(person => (
                <th key={person.code}>
                  {person.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {panel.capabilities.map((capability, index) => (
              <tr key={capability.id}>
                <td>
                  {index + 1}) {capability.description}
                </td>
                <td>{capability.expected || '-'}</td>
                {panel.interviewers.map(person => (
                  <td key={person.code}>{person.levels[capability.id] || '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

/* Session as Recommender (17). Legacy session_int_reco.php. */
const RecommenderForm = ({ details, form, setForm, busy }) => {
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const pending = details.pendingInterviewers
  return (
    <>
      {pending.length > 0 && (
        <div className='alert alert-warning'>
          Interview pending: {pending.join(', ')} {pending.length === 1 ? 'has' : 'have'} not filled the interview details yet.
        </div>
      )}
      <PanelResults panel={details.panel} />
      {/* Result and offer details come after the feedback comparison. */}
      <div className='row g-3 mt-3'>
        <div className='col-md-3'>
          <label className='form-label'>
            Result <span className='text-danger'>*</span>
          </label>
          <SDLReactSelect
            value={form.result}
            options={details.results}
            placeholder='Please Select'
            isDisabled={busy || pending.length > 0}
            onChange={value => set('result', value || '')}
          />
        </div>
        {form.result === 'P' && (
          <>
            <div className='col-md-3'>
              <label className='form-label' htmlFor='reco-ctc'>
                Annual CTC Offer (In ₹) <span className='text-danger'>*</span>
              </label>
              <input
                id='reco-ctc'
                inputMode='numeric'
                placeholder='e.g. 264000'
                className='form-control text-end'
                value={form.ctcOffer}
                disabled={busy}
                // Whole rupees, up to 9 digits.
                onChange={event => set('ctcOffer', event.target.value.replace(/\D/g, '').slice(0, 9))}
              />
              {Number(form.ctcOffer) > 0 && (
                <small className='text-muted d-block mt-1'>
                  ₹{Number(form.ctcOffer).toLocaleString('en-IN')} (
                  {(Number(form.ctcOffer) / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Lakhs p.a.)
                </small>
              )}
            </div>
            <div className='col-md-3'>
              <label className='form-label'>
                Employee Type <span className='text-danger'>*</span>
              </label>
              <SDLReactSelect
                value={form.employeeType}
                options={details.employeeTypes}
                placeholder='Please Select'
                isDisabled={busy}
                onChange={value => set('employeeType', value || '')}
              />
            </div>
            <div className='col-md-3'>
              <label className='form-label'>
                Tentative Joining Date <span className='text-danger'>*</span>
              </label>
              <SDLCalendar
                value={parseDateValue(form.joiningDate)}
                onChange={date => set('joiningDate', date ? toDateInputValue(date) : '')}
                allowAllDates
                disabled={busy}
              />
            </div>
            {String(form.employeeType) !== String(details.permanentType) && (
              <div className='col-md-3'>
                <label className='form-label' htmlFor='reco-period'>
                  Period (Months) <span className='text-danger'>*</span>
                </label>
                <input
                  id='reco-period'
                  type='number'
                  min='1'
                  step='1'
                  className='form-control text-end'
                  value={form.period}
                  disabled={busy}
                  onChange={event => set('period', event.target.value)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

/** Form values from what the user saved earlier. */
const formFromSaved = (data, isInterviewer) => {
  const saved = data.saved
  if (!isInterviewer) {
    return {
      result: saved.result || '',
      ctcOffer: saved.ctcOffer || '',
      employeeType: saved.employeeType || '',
      joiningDate: saved.joiningDate || '',
      period: saved.period || ''
    }
  }
  return {
    answers: Object.fromEntries(
      data.questions.map(question => {
        const text = saved.answers[question.id]?.answer || ''
        return [question.id, question.type === 'C' ? (text ? text.split(',') : []) : text]
      })
    ),
    answerRemarks: Object.fromEntries(Object.entries(saved.answers).map(([id, answer]) => [id, answer.remarks || ''])),
    levels: { ...saved.levels },
    result: saved.result || '',
    remarks: saved.remarks || ''
  }
}

/* Tasks 9 and 17. */
const FeedbackTask = ({ taskId, title, record, onClose, onSuccess }) => {
  const isInterviewer = taskId === TASK_INTERVIEWER
  const [form, setForm] = useState(null)
  const [tab, setTab] = useState('questions')
  // Set by a Submit attempt: unanswered rows are then highlighted until filled.
  const [showMissing, setShowMissing] = useState(false)
  const { details, loadError, busy, actionError, setActionError, run } = useFlowTask({
    taskId,
    record,
    onSuccess,
    onLoaded: data => setForm(formFromSaved(data, isInterviewer))
  })

  const payload = () =>
    isInterviewer
      ? { answers: form.answers, answer_remarks: form.answerRemarks, levels: form.levels, result: form.result, remarks: form.remarks }
      : {
          result: form.result,
          ctc_offer: form.ctcOffer,
          employee_type: form.employeeType,
          joining_date: form.joiningDate,
          period: form.period
        }

  const validRecommendation = () => {
    if (!form.result) return 'Please select the result.'
    if (form.result !== 'P') return ''
    const ctc = Number(form.ctcOffer)
    if (!(ctc >= 10000)) return 'Please enter the annual CTC offer in rupees (at least ₹10,000).'
    // Stored in lakhs with 2 decimals, so whole thousands only.
    if (ctc % 1000 !== 0) return 'Please enter the annual CTC offer in multiples of ₹1,000.'
    if (!form.employeeType) return 'Please select the employee type.'
    if (!form.joiningDate) return 'Please select the tentative joining date.'
    // No period for a permanent employee.
    if (String(form.employeeType) === String(details.permanentType)) return ''
    if (!(Number(form.period) > 0) || !Number.isInteger(Number(form.period))) return 'Please enter the period in months.'
    return ''
  }

  const save = () => {
    if (!isInterviewer) {
      const error = validRecommendation()
      if (error) {
        setActionError(error)
        return
      }
    }
    run('save', payload())
  }

  const submit = () => {
    if (isInterviewer) {
      // Every question and capability is required to submit (Save stays free).
      const { questions, remarks, capabilities } = missingFeedback(details, form)
      if (questions.size || remarks.size || capabilities.size) {
        setShowMissing(true)
        setTab(questions.size || remarks.size ? 'questions' : 'capabilities')
        const parts = []
        if (questions.size) parts.push(`answer all interview questions (${questions.size} pending)`)
        if (remarks.size) parts.push(`enter remarks for every question (${remarks.size} pending)`)
        if (capabilities.size) parts.push(`rate all capabilities (${capabilities.size} pending)`)
        setActionError(`Please ${parts.join(' and ')} before submitting.`)
        return
      }
      if (!form.result) {
        setTab('result')
        setActionError('Please select the result.')
        return
      }
    }
    if (!isInterviewer) {
      const error = validRecommendation()
      if (error) {
        setActionError(error)
        return
      }
    }
    run('submit', payload(), {
      confirm: isInterviewer
        ? ['Submit your feedback?', 'You will not be able to change it afterwards.']
        : form.result === 'P'
          ? ['Submit the recommendation?', 'A Generate Offer task will be generated for HR.']
          : ['Submit the recommendation?', 'You will not be able to change it afterwards.'],
      close: true
    })
  }

  const blocked = !isInterviewer && details?.pendingInterviewers?.length > 0

  return (
    <RecruitmentModal
      titleId='recruitment-flow-title'
      title={details ? `${title} - ${details.candidate?.name || ''}` : title}
      size='xl'
      loading={!details && !loadError}
      loadError={loadError}
      onClose={onClose}
      footer={
        form && (
          <div className='d-flex gap-2'>
            <SaveButton onClick={save} disabled={busy || blocked}>
              Save
            </SaveButton>
            <button type='button' className='btn btn-success' onClick={submit} disabled={busy || blocked}>
              {busy ? 'Processing...' : 'Submit'}
            </button>
          </div>
        )
      }
    >
      {details && form && (
        <>
          <ActionError message={actionError} />
          <FlowSummary details={details}>
            {!isInterviewer && <PanelSummary panel={details.panel} />}
          </FlowSummary>
          {isInterviewer ? (
            <InterviewerForm
              details={details}
              form={form}
              setForm={setForm}
              busy={busy}
              tab={tab}
              setTab={setTab}
              missing={showMissing ? missingFeedback(details, form) : null}
            />
          ) : (
            <RecommenderForm details={details} form={form} setForm={setForm} busy={busy} />
          )}
        </>
      )}
    </RecruitmentModal>
  )
}

export default FeedbackTask
