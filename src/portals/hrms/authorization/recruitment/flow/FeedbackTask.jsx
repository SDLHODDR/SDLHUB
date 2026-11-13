import { useMemo, useState } from 'react'
import SaveButton from '../../../../../shared/components/buttons/SaveButton'
import SDLCalendar from '../../../../../shared/components/calendar/SDLCalendar'
import SDLReactSelect from '../../../../../shared/components/form/SDLReactSelect'
import { parseDateValue, toDateInputValue } from '../../../../../shared/utils/commonUtils'
import RecruitmentModal from '../../../pages/recruitment/RecruitmentModal'
import { ActionError, FlowSummary, SecondaryButton } from './flowShared'
import { useFlowTask } from './useFlowTask'

const TASK_INTERVIEWER = 9
const ANSWER_MAX = 1000
const REMARK_MAX = 200

const Tabs = ({ tabs, active, onChange }) => (
  <ul className='nav nav-tabs mb-3' role='tablist'>
    {tabs.map(tab => (
      <li className='nav-item' key={tab.key} role='presentation'>
        <button
          type='button'
          role='tab'
          aria-selected={active === tab.key}
          className={`nav-link${active === tab.key ? ' active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      </li>
    ))}
  </ul>
)

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
      <input
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

/* Interview Session (9). Legacy session_int.php. */
const InterviewerForm = ({ details, form, setForm, busy }) => {
  const [tab, setTab] = useState('questions')
  const questionGroups = useMemo(() => groupRows(details.questions), [details.questions])
  const capabilityGroups = useMemo(() => groupRows(details.capabilities), [details.capabilities])
  const set = (key, id, value) => setForm(current => ({ ...current, [key]: { ...current[key], [id]: value } }))

  return (
    <>
      <Tabs
        tabs={[
          { key: 'questions', label: 'Interview Questions' },
          { key: 'capabilities', label: 'Capabilities' },
          { key: 'result', label: 'Final Result' }
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'questions' && (
        <div className='table-responsive'>
          {details.questions.length === 0 && <div className='alert alert-warning'>No interview questions are set for this job description.</div>}
          <table className='table table-bordered table-sm align-middle mb-0 recruitment-flow-table'>
            <tbody>
              {questionGroups.map(group => [
                group.name && (
                  <tr key={`g-${group.name}`}>
                    <th colSpan={3} className='text-primary'>
                      {group.name}
                    </th>
                  </tr>
                ),
                ...group.rows.map((question, index) => (
                  <tr key={question.id}>
                    <td style={{ width: '35%' }} className='fw-semibold'>
                      {index + 1}) {question.question}
                    </td>
                    <td style={{ width: '30%' }}>
                      <QuestionInput
                        question={question}
                        value={form.answers[question.id]}
                        disabled={busy}
                        onChange={value => set('answers', question.id, value)}
                      />
                    </td>
                    <td style={{ width: '35%' }}>
                      <textarea
                        className='form-control form-control-sm'
                        rows={1}
                        placeholder='Remarks'
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
                  <th colSpan={2} className='text-primary'>
                    {group.name}
                  </th>
                </tr>,
                ...group.rows.map((capability, index) => (
                  <tr key={capability.id}>
                    <td style={{ width: '60%' }} className='fw-semibold'>
                      {index + 1}) {capability.description}
                    </td>
                    <td>
                      <select
                        className='form-select form-select-sm'
                        aria-label={`Level for ${capability.description}`}
                        value={form.levels[capability.id] || ''}
                        disabled={busy}
                        onChange={event => set('levels', capability.id, event.target.value)}
                      >
                        <option value=''>Please Select</option>
                        {details.levels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
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
    </>
  )
}

/* Every interviewer's answers and capability levels (legacy "View Results"). */
const PanelResults = ({ panel }) => {
  if (panel.interviewers.length === 0) return null
  return (
    <>
      <h6 className='mt-3'>Comparison of the Feedback</h6>
      <div className='table-responsive'>
        <table className='table table-bordered table-sm mb-3 recruitment-flow-table'>
          <thead>
            <tr>
              <th>Question</th>
              {panel.interviewers.map(person => (
                <th key={person.code}>
                  {person.name} {person.resultText && `(${person.resultText})`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {panel.questions.map(question => (
              <tr key={question.id}>
                <td>{question.question}</td>
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
      <div className='table-responsive'>
        <table className='table table-bordered table-sm mb-0 recruitment-flow-table'>
          <thead>
            <tr>
              <th>Skill</th>
              <th>Expected Level</th>
              {panel.interviewers.map(person => (
                <th key={person.code}>
                  {person.name} ({person.score} / {panel.expectedScore})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {panel.capabilities.map(capability => (
              <tr key={capability.id}>
                <td>{capability.description}</td>
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
      <div className='row g-3'>
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
                CTC Offer (Lakhs p.a.) <span className='text-danger'>*</span>
              </label>
              <input
                id='reco-ctc'
                type='number'
                min='0'
                step='0.01'
                className='form-control text-end'
                value={form.ctcOffer}
                disabled={busy}
                onChange={event => set('ctcOffer', event.target.value)}
              />
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
          </>
        )}
      </div>
      <PanelResults panel={details.panel} />
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
    if (!(Number(form.ctcOffer) > 0)) return 'Please enter the CTC offer.'
    if (!form.employeeType) return 'Please select the employee type.'
    if (!form.joiningDate) return 'Please select the tentative joining date.'
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
          <>
            <SecondaryButton onClick={save} disabled={busy || blocked}>
              Save
            </SecondaryButton>
            <SaveButton onClick={submit} isSubmitting={busy} disabled={blocked}>
              Submit
            </SaveButton>
          </>
        )
      }
    >
      {details && form && (
        <>
          <ActionError message={actionError} />
          <FlowSummary details={details} />
          {isInterviewer ? (
            <InterviewerForm details={details} form={form} setForm={setForm} busy={busy} />
          ) : (
            <RecommenderForm details={details} form={form} setForm={setForm} busy={busy} />
          )}
        </>
      )}
    </RecruitmentModal>
  )
}

export default FeedbackTask
