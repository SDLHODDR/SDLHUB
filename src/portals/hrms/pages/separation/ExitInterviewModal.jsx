import { Fragment, useState } from 'react'
import SaveButton from '../../../../shared/components/buttons/SaveButton'
import CancelButton from '../../../../shared/components/buttons/CancelButton'
import { confirmAction } from '../../../../shared/services/alertService'
import useExitTask from '../../hooks/useExitTask'
import { saveExitInterview } from '../../services/exitService'
import ExitModalShell from './ExitModalShell'
import ExitEmployeeSummary from './ExitEmployeeSummary'

// HR_EMP_EXIT_INTRV.EMP_ANS_TEXT allows 1000 characters.
const MAX_TEXT_ANSWER_LENGTH = 1000
// HR_EMP_SEPARATION.EXIT_COMMENTS allows 500 characters.
const MAX_EXIT_COMMENTS_LENGTH = 500

const splitAnswer = value =>
  String(value ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)

const InterviewForm = ({ details, task, shellProps }) => {
  const { employee, separation, questions = [] } = details
  const { busyAction, run, record } = task

  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(questions.map(question => [question.id, question.answer || '']))
  )
  const [retentionFlag, setRetentionFlag] = useState(separation.retentionFlag || 'N')
  const [exitComments, setExitComments] = useState(separation.exitComments || '')
  const [errors, setErrors] = useState({})
  // Submit is offered once everything is saved (legacy: all answered + comments saved).
  const [saved, setSaved] = useState(
    Boolean(separation.exitComments) &&
      questions.length > 0 &&
      questions.every(question => question.answer)
  )

  const updateAnswer = (questionId, value) => {
    setAnswers(current => ({ ...current, [questionId]: value }))
    setErrors(current => ({ ...current, [questionId]: '' }))
    setSaved(false)
  }

  const validate = requireAll => {
    const next = {}
    if (!exitComments.trim()) next.exitComments = 'Exit / retention comments are required.'
    if (requireAll) {
      questions.forEach(question => {
        if (!String(answers[question.id] ?? '').trim()) {
          next[question.id] = 'This question is required.'
        }
      })
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const payload = action => ({
    user_task_id: record.ID,
    action,
    answers,
    retention_flag: retentionFlag,
    exit_comments: exitComments
  })

  const handleSave = async () => {
    if (!validate(false)) return
    const ok = await run('save', () => saveExitInterview(payload('save')))
    if (ok) setSaved(true)
  }

  const handleSubmit = async () => {
    if (!validate(true)) return
    const confirmed = await confirmAction(
      'Submit exit interview?',
      retentionFlag === 'N'
        ? 'Once the exit interview is submitted, the system will generate tasks for deactivate user as well as departmental clearance.'
        : 'Once the exit interview is submitted, the system will skip all further exit processes, as retention flag is set to YES.'
    )
    if (!confirmed) return
    run('submit', () => saveExitInterview(payload('submit')), { close: true })
  }

  const renderAnswer = question => {
    const invalid = errors[question.id] ? ' border border-danger rounded p-1' : ''
    if (question.input_type === 'checkbox') {
      const selected = splitAnswer(answers[question.id])
      return (
        <div className={`tenure-rating-options${invalid}`}>
          {question.options.map(option => (
            <label key={option} className='form-check form-check-inline'>
              <input
                className='form-check-input'
                type='checkbox'
                checked={selected.includes(option)}
                onChange={event =>
                  updateAnswer(
                    question.id,
                    (event.target.checked
                      ? [...selected, option]
                      : selected.filter(item => item !== option)
                    ).join(',')
                  )
                }
              />
              <span className='form-check-label'>{option}</span>
            </label>
          ))}
        </div>
      )
    }
    if (question.input_type === 'radio') {
      return (
        <div className={`tenure-rating-options${invalid}`}>
          {question.options.map(option => (
            <label key={option} className='form-check form-check-inline'>
              <input
                className='form-check-input'
                type='radio'
                name={`exit-question-${question.id}`}
                value={option}
                checked={answers[question.id] === option}
                onChange={() => updateAnswer(question.id, option)}
              />
              <span className='form-check-label'>{option}</span>
            </label>
          ))}
        </div>
      )
    }
    const text = answers[question.id] ?? ''
    return (
      <>
        {/* tenure-rating-answer gives the textarea its full height (theme fixes textarea height). */}
        <textarea
          className={`form-control tenure-rating-answer${errors[question.id] ? ' is-invalid' : ''}`}
          rows='4'
          placeholder='Remarks'
          maxLength={MAX_TEXT_ANSWER_LENGTH}
          value={text}
          onChange={event => updateAnswer(question.id, event.target.value)}
        />
        <small className='text-muted d-block text-end mt-1'>
          {text.length} / {MAX_TEXT_ANSWER_LENGTH}
        </small>
      </>
    )
  }

  const busy = Boolean(busyAction)

  return (
    <ExitModalShell
      {...shellProps}
      footer={
        questions.length > 0 && (
          <>
            <SaveButton
              onClick={handleSave}
              disabled={busy}
              isSubmitting={busyAction === 'save'}
              className='me-2'
            >
              Save
            </SaveButton>
            <button
              type='button'
              className='btn btn-success me-2'
              onClick={handleSubmit}
              disabled={!saved || busy}
              title={!saved ? 'Save all answers and comments before submitting.' : undefined}
            >
              {busyAction === 'submit' ? 'Processing...' : 'Submit'}
            </button>
            <CancelButton onClick={task.onClose} disabled={busy} />
          </>
        )
      }
    >
      <ExitEmployeeSummary
        employee={employee}
        relievingDate={separation.relievingDate}
      />

      {questions.length === 0 ? (
        <div className='alert alert-info'>
          No exit interview questions are configured for this employee&apos;s
          Job Description.
        </div>
      ) : (
        <>
          <div className='table-responsive tenure-rating-table-wrap'>
            <table className='table table-bordered tenure-rating-table mb-0'>
              <tbody>
                {questions.map((question, index) => {
                  const startsGroup =
                    index === 0 ||
                    questions[index - 1].subgroup !== question.subgroup
                  return (
                    <Fragment key={question.id}>
                      {startsGroup && (
                        <tr className='tenure-rating-section-row tenure-rating-subgroup-row'>
                          <th colSpan='2'>{question.subgroup || 'GENERAL'}</th>
                        </tr>
                      )}
                      <tr>
                        <th className='tenure-rating-question'>
                          {index + 1}) {question.question}
                        </th>
                        <td>
                          {renderAnswer(question)}
                          {errors[question.id] && (
                            <small className='text-danger d-block mt-1'>
                              {errors[question.id]}
                            </small>
                          )}
                        </td>
                      </tr>
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className='row g-3 mt-2'>
            <div className='col-lg-3 col-md-4'>
              <label className='form-label'>Retain Employee</label>
              <select
                className='form-select tenure-change-select'
                value={retentionFlag}
                onChange={event => {
                  setRetentionFlag(event.target.value)
                  setSaved(false)
                }}
              >
                <option value='N'>No</option>
                <option value='Y'>Yes</option>
              </select>
            </div>
            <div className='col-lg-9 col-md-8'>
              <label className='form-label'>
                Exit / Retention Comments <span className='text-danger'>*</span>
              </label>
              {/* Plain form-control textarea keeps the theme's single-field height. */}
              <textarea
                className={`form-control${errors.exitComments ? ' is-invalid' : ''}`}
                rows='1'
                value={exitComments}
                maxLength={MAX_EXIT_COMMENTS_LENGTH}
                onChange={event => {
                  setExitComments(event.target.value)
                  setErrors(current => ({ ...current, exitComments: '' }))
                  setSaved(false)
                }}
              />
              <small className='text-muted d-block text-end mt-1'>
                {exitComments.length} / {MAX_EXIT_COMMENTS_LENGTH}
              </small>
              {errors.exitComments && (
                <small className='text-danger d-block mt-1'>
                  {errors.exitComments}
                </small>
              )}
            </div>
          </div>
        </>
      )}
    </ExitModalShell>
  )
}

const ExitInterviewModal = ({ config, record, onClose, onSuccess }) => {
  const task = useExitTask({ record, onClose, onSuccess })
  const shellProps = {
    titleId: 'exit-interview-title',
    title: config?.title || 'Exit Interview',
    record,
    loading: task.loading,
    loadError: task.loadError,
    actionError: task.actionError,
    onClose
  }

  if (!task.details) return <ExitModalShell {...shellProps} />
  return (
    <InterviewForm
      details={task.details}
      task={{ ...task, record, onClose }}
      shellProps={shellProps}
    />
  )
}

export default ExitInterviewModal
