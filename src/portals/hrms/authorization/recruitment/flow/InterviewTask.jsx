import { useState } from 'react'
import Select from 'react-select'
import SaveButton from '../../../../../shared/components/buttons/SaveButton'
import SDLCalendar from '../../../../../shared/components/calendar/SDLCalendar'
import SDLReactSelect from '../../../../../shared/components/form/SDLReactSelect'
import { parseDateValue, toDateInputValue } from '../../../../../shared/utils/commonUtils'
import RecruitmentModal from '../../../pages/recruitment/RecruitmentModal'
import { ActionError, Detail, FlowSummary, SecondaryButton } from './flowShared'
import { useFlowTask } from './useFlowTask'

const TASK_SCHEDULE = 8
const TASK_CONFIRMATION = 16
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/
const OUTCOMES = [
  { value: 'C', label: 'Candidate confirmed the interview' },
  { value: 'R', label: 'Candidate asked to reschedule' }
]

const multiSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '38px',
    fontSize: '13px',
    borderColor: state.isFocused ? '#ff9800' : '#6c757d',
    boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(255, 152, 0, 0.15)' : 'none'
  }),
  menuPortal: base => ({ ...base, zIndex: 3000 })
}

const InterviewHistory = ({ history }) => (
  <div className='table-responsive mt-3'>
    <table className='table table-bordered table-sm mb-0 recruitment-flow-table'>
      <thead>
        <tr>
          <th style={{ width: '3rem' }}>No</th>
          <th>Interview Date</th>
          <th>Interview Time</th>
          <th>Interview Mode</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {history.length === 0 && (
          <tr>
            <td colSpan={5} className='text-center text-muted'>
              No interview scheduled yet.
            </td>
          </tr>
        )}
        {history.map((row, index) => (
          <tr key={row.id}>
            <td>{index + 1}</td>
            <td>{row.dateText}</td>
            <td>{row.time}</td>
            <td>{row.modeText}</td>
            <td>{row.statusText}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

/* Schedule Interview (8). Submit records the candidate's answer to the invitation (legacy conf_interview.php). */
const ScheduleForm = ({ details, form, setForm, errors, busy }) => (
  <>
    <div className='row g-3'>
      <div className='col-md-3'>
        <label className='form-label'>
          Interview Date <span className='text-danger'>*</span>
        </label>
        <SDLCalendar
          value={parseDateValue(form.date)}
          onChange={date => setForm(current => ({ ...current, date: date ? toDateInputValue(date) : '' }))}
          allowAllDates
          disabled={busy}
          inputClassName={errors.date ? 'is-invalid' : ''}
        />
        {errors.date && <small className='text-danger'>{errors.date}</small>}
      </div>
      <div className='col-md-3'>
        <label className='form-label' htmlFor='intrv-time'>
          Interview Time (24 hrs) <span className='text-danger'>*</span>
        </label>
        <input
          id='intrv-time'
          type='time'
          className={`form-control${errors.time ? ' is-invalid' : ''}`}
          value={form.time}
          disabled={busy}
          onChange={event => setForm(current => ({ ...current, time: event.target.value }))}
        />
        {errors.time && <small className='text-danger'>{errors.time}</small>}
      </div>
      <div className='col-md-3'>
        <label className='form-label'>
          Interview Mode <span className='text-danger'>*</span>
        </label>
        <SDLReactSelect
          value={form.mode}
          options={details.modes}
          placeholder='Please Select'
          isDisabled={busy}
          onChange={value => setForm(current => ({ ...current, mode: value || '' }))}
        />
        {errors.mode && <small className='text-danger'>{errors.mode}</small>}
      </div>
    </div>
    <div className='mt-3'>
      <label className='form-label d-block'>Candidate&apos;s response (required to submit)</label>
      {OUTCOMES.map(option => (
        <div className='form-check form-check-inline' key={option.value}>
          <input
            className='form-check-input'
            type='radio'
            name='intrv-outcome'
            id={`intrv-outcome-${option.value}`}
            value={option.value}
            checked={form.outcome === option.value}
            disabled={busy}
            onChange={() => setForm(current => ({ ...current, outcome: option.value }))}
          />
          <label className='form-check-label' htmlFor={`intrv-outcome-${option.value}`}>
            {option.label}
          </label>
        </div>
      ))}
      {errors.outcome && <small className='text-danger d-block'>{errors.outcome}</small>}
    </div>
    <InterviewHistory history={details.history} />
  </>
)

/* Tasks 8, 16 and 11. Legacy schedule_int.php, conf_can_int.php, assign_int.php. */
const InterviewTask = ({ taskId, title, record, onClose, onSuccess }) => {
  const [form, setForm] = useState({ date: '', time: '', mode: '', outcome: '' })
  const [panel, setPanel] = useState({ interviewers: [], recommender: '' })
  const [errors, setErrors] = useState({})
  const { details, loadError, busy, actionError, setActionError, run } = useFlowTask({
    taskId,
    record,
    onSuccess,
    onLoaded: data => {
      if (data.current) {
        const { date, time, mode } = data.current
        setForm(current => ({ ...current, date, time, mode }))
      }
    }
  })

  const validSchedule = needOutcome => {
    const next = {}
    if (!form.date) next.date = 'Interview date is required.'
    if (!TIME_PATTERN.test(form.time)) next.time = 'Please enter the time as HH:MM.'
    if (!form.mode) next.mode = 'Please select the interview mode.'
    if (needOutcome && !form.outcome) next.outcome = "Please select the candidate's response."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const schedulePayload = () => ({ date: form.date, time: form.time, mode: form.mode, outcome: form.outcome })

  const saveSchedule = () => {
    if (validSchedule(false)) run('save', schedulePayload())
  }

  const submitSchedule = () => {
    if (!validSchedule(true)) return
    run('submit', schedulePayload(), {
      confirm: form.outcome === 'C'
        ? ['Interview confirmed by the candidate?', 'An Interview Confirmation task will be generated.']
        : ['Reschedule this interview?', 'A new Schedule Interview task will be generated for you.'],
      close: true
    })
  }

  const assign = () => {
    const next = {}
    if (panel.interviewers.length === 0) next.interviewers = 'Please select at least one interviewer.'
    if (!panel.recommender) next.recommender = 'Please select the recommender.'
    setErrors(next)
    if (Object.keys(next).length) return
    run('assign', { interviewers: panel.interviewers, recommender: panel.recommender }, {
      confirm: ['Assign the interview panel?', 'Feedback tasks will be generated for the interviewers and the recommender.'],
      close: true
    })
  }

  let footer = null
  if (details) {
    if (taskId === TASK_SCHEDULE) {
      footer = (
        <>
          <SecondaryButton onClick={saveSchedule} disabled={busy}>
            Save
          </SecondaryButton>
          <SaveButton onClick={submitSchedule} isSubmitting={busy}>
            Submit
          </SaveButton>
        </>
      )
    } else if (taskId === TASK_CONFIRMATION) {
      footer = (
        <SaveButton
          isSubmitting={busy}
          disabled={!details.confirmed}
          onClick={() =>
            run('send', {}, {
              confirm: ['Send to HOD?', 'A task will be generated for the HOD to assign the interviewers and recommender.'],
              close: true
            })
          }
        >
          Send to HOD
        </SaveButton>
      )
    } else {
      footer = (
        <SaveButton onClick={assign} isSubmitting={busy} disabled={!details.confirmed}>
          Schedule Interview
        </SaveButton>
      )
    }
  }

  const selectedInterviewers = (details?.employees || []).filter(option => panel.interviewers.includes(option.value))

  return (
    <RecruitmentModal
      titleId='recruitment-flow-title'
      title={details ? `${title} - ${details.candidate?.name || ''}` : title}
      size='lg'
      loading={!details && !loadError}
      loadError={loadError}
      onClose={onClose}
      footer={footer}
    >
      {details && (
        <>
          <ActionError message={actionError} />
          <FlowSummary details={details} />
          {taskId === TASK_SCHEDULE ? (
            <ScheduleForm details={details} form={form} setForm={setForm} errors={errors} busy={busy} />
          ) : !details.confirmed ? (
            <div className='alert alert-warning mb-0'>No confirmed interview was found for this candidate.</div>
          ) : (
            <div className='row g-3'>
              <Detail label='Interview Date' value={details.confirmed.dateText} />
              <Detail label='Interview Time' value={details.confirmed.time} />
              <Detail label='Interview Mode' value={details.confirmed.modeText} />
              <Detail label='Status' value={details.confirmed.statusText} />
              {taskId !== TASK_CONFIRMATION && (
                <>
                  <div className='col-md-8'>
                    <label className='form-label'>
                      Interviewers <span className='text-danger'>*</span>
                    </label>
                    <Select
                      isMulti
                      inputId='intrv-interviewers'
                      options={details.employees}
                      value={selectedInterviewers}
                      placeholder='Please Select'
                      isDisabled={busy}
                      styles={multiSelectStyles}
                      menuPortalTarget={document.body}
                      onChange={options => {
                        setPanel(current => ({ ...current, interviewers: (options || []).map(option => option.value) }))
                        setActionError('')
                      }}
                    />
                    {errors.interviewers && <small className='text-danger'>{errors.interviewers}</small>}
                  </div>
                  <div className='col-md-4'>
                    <label className='form-label'>
                      Recommender <span className='text-danger'>*</span>
                    </label>
                    <SDLReactSelect
                      value={panel.recommender}
                      options={details.employees}
                      placeholder='Please Select'
                      isDisabled={busy}
                      onChange={value => setPanel(current => ({ ...current, recommender: value || '' }))}
                    />
                    {errors.recommender && <small className='text-danger'>{errors.recommender}</small>}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </RecruitmentModal>
  )
}

export default InterviewTask
