import { useState } from 'react'
import SaveButton from '../../../../../shared/components/buttons/SaveButton'
import SDLCalendar from '../../../../../shared/components/calendar/SDLCalendar'
import SDLReactSelect from '../../../../../shared/components/form/SDLReactSelect'
import { parseDateValue, toDateInputValue } from '../../../../../shared/utils/commonUtils'
import { offerLetterUrl } from '../../../services/recruitmentService'
import RecruitmentModal from '../../../pages/recruitment/RecruitmentModal'
import { ActionError, FlowSummary, SecondaryButton } from './flowShared'
import { formatAmount, useFlowTask } from './useFlowTask'

const TASK_GENERATE = 10
const TASK_ANNEXURE = 21
const TASK_PRINT = 22
const AMOUNT_PATTERN = /^\d{1,8}(\.\d{1,2})?$/
const ACCEPTANCE = [
  { value: 'Y', label: 'Yes' },
  { value: 'N', label: 'No' }
]

const sum = values => values.reduce((total, value) => total + (Number(value) || 0), 0)

/* Monthly amount per CTC head; annual is 12 x monthly (legacy offer_generate.php). */
const CtcTable = ({ heads, amounts, setAmounts, busy, showSuggested }) => (
  <div className='table-responsive'>
    <table className='table table-bordered table-sm align-middle mb-0 recruitment-flow-table'>
      <thead>
        <tr>
          <th style={{ width: '3rem' }}>No</th>
          <th>CTC Head</th>
          {showSuggested && <th className='text-end'>As per Structure Monthly (₹)</th>}
          {showSuggested && <th className='text-end'>As per Structure Annually (₹)</th>}
          <th className='text-end' style={{ width: '11rem' }}>
            Monthly (₹)
          </th>
          <th className='text-end'>Annual (₹)</th>
        </tr>
      </thead>
      <tbody>
        {heads.map((head, index) => (
          <tr key={head.code}>
            <td>{index + 1}</td>
            <td>{head.description}</td>
            {showSuggested && <td className='text-end'>{formatAmount(head.suggested)}</td>}
            {showSuggested && <td className='text-end'>{formatAmount(head.suggested * 12)}</td>}
            <td>
              <input
                type='number'
                min='0'
                step='0.01'
                className='form-control form-control-sm text-end'
                aria-label={`Monthly ${head.description}`}
                value={amounts[head.code] ?? ''}
                disabled={busy}
                onChange={event => setAmounts(current => ({ ...current, [head.code]: event.target.value }))}
              />
            </td>
            <td className='text-end'>{amounts[head.code] !== '' && amounts[head.code] != null ? formatAmount(amounts[head.code] * 12) : ''}</td>
          </tr>
        ))}
        <tr className='fw-semibold'>
          <td colSpan={2} className='text-end'>
            Sum in ₹:
          </td>
          {showSuggested && <td className='text-end'>{formatAmount(sum(heads.map(head => head.suggested)))}</td>}
          {showSuggested && <td className='text-end'>{formatAmount(sum(heads.map(head => head.suggested)) * 12)}</td>}
          <td className='text-end'>{formatAmount(sum(Object.values(amounts)))}</td>
          <td className='text-end'>{formatAmount(sum(Object.values(amounts)) * 12)}</td>
        </tr>
      </tbody>
    </table>
  </div>
)

/* Tasks 10, 21, 22 and 12. Legacy offer_generate.php / offer_generate_auth.php. */
const OfferTask = ({ taskId, title, record, onClose, onSuccess }) => {
  const [amounts, setAmounts] = useState({})
  const [acceptance, setAcceptance] = useState({ accepted: '', date: '' })
  const [showPreview, setShowPreview] = useState(false)
  const [letterOpened, setLetterOpened] = useState(false)
  const { details, loadError, busy, actionError, setActionError, run } = useFlowTask({
    taskId,
    record,
    onSuccess,
    onLoaded: data => {
      if (data.heads) {
        setAmounts(
          Object.fromEntries(
            data.heads.map(head => [
              head.code,
              head.monthly != null ? String(head.monthly) : taskId === TASK_GENERATE ? String(head.suggested) : ''
            ])
          )
        )
      }
      if (data.offer) setAcceptance({ accepted: data.offer.accepted || '', date: data.offer.acceptDate || '' })
    }
  })

  const validAmounts = () => {
    const invalid = details.heads.some(head => !AMOUNT_PATTERN.test(String(amounts[head.code] ?? '').trim()))
    if (invalid) {
      setActionError('Please enter a valid monthly amount for every CTC head.')
      return false
    }
    return true
  }

  const amountsPayload = () => Object.fromEntries(details.heads.map(head => [head.code, String(amounts[head.code]).trim()]))

  let footer = null
  let body = null
  if (details) {
    if (taskId === TASK_GENERATE || taskId === TASK_ANNEXURE) {
      const isGenerate = taskId === TASK_GENERATE
      footer = (
        <>
          {!isGenerate && (
            <>
              <SecondaryButton onClick={() => setShowPreview(value => !value)} disabled={busy}>
                {showPreview ? 'Hide Email Preview' : 'Preview Email'}
              </SecondaryButton>
              <SecondaryButton
                disabled={busy}
                onClick={() =>
                  run('email', {}, {
                    confirm: ['Send the CTC breakup e-mail?', `It will be sent to ${details.emailTo.join(', ')} (cc ${details.emailCc.join(', ')}).`]
                  })
                }
              >
                Send Email
              </SecondaryButton>
            </>
          )}
          <SecondaryButton onClick={() => validAmounts() && run('save', { amounts: amountsPayload() })} disabled={busy}>
            Save CTC
          </SecondaryButton>
          <SaveButton
            isSubmitting={busy}
            onClick={() =>
              validAmounts() &&
              run(isGenerate ? 'submit' : 'authorize', { amounts: amountsPayload() }, {
                confirm: isGenerate
                  ? ['Submit the offer?', 'An Annexure Approval task will be generated.']
                  : ['Authorize the annexure?', 'A Print Offer Letter task will be generated for HR.'],
                close: true
              })
            }
          >
            {isGenerate ? 'Submit' : 'Authorize'}
          </SaveButton>
        </>
      )
      body = (
        <>
          {isGenerate && (
            <p className='text-muted small'>
              Suggested structure for a CTC of ₹{formatAmount(details.monthlyCtc)} per month. Enter the final monthly amount of each head.
            </p>
          )}
          {details.heads.length === 0 ? (
            <div className='alert alert-warning mb-0'>The job description has no CTC structure.</div>
          ) : (
            <CtcTable heads={details.heads} amounts={amounts} setAmounts={setAmounts} busy={busy} showSuggested={isGenerate} />
          )}
          {!isGenerate && showPreview && (
            <div className='border rounded p-3 mt-3 bg-white overflow-auto'>
              <div className='small text-muted mb-2'>
                To: {details.emailTo.join(', ')} | Cc: {details.emailCc.join(', ')} | Subject: CTC Breakup
                <br />
                The preview shows the last saved amounts.
              </div>
              {/* Built and escaped by the backend (recruitmentFlowCtcMailBody). */}
              <div dangerouslySetInnerHTML={{ __html: details.emailPreview }} />
            </div>
          )}
        </>
      )
    } else if (taskId === TASK_PRINT) {
      const url = offerLetterUrl(record.ID)
      footer = (
        <>
          <a className='btn btn-outline-primary' href={url} target='_blank' rel='noreferrer' onClick={() => setLetterOpened(true)}>
            <i className='fas fa-print me-1' /> Print Offer Letter
          </a>
          <SaveButton
            isSubmitting={busy}
            onClick={() =>
              run('close', {}, {
                confirm: [
                  'Close this task?',
                  letterOpened
                    ? 'An Update Offer Acceptance task will be generated for the recruiter.'
                    : 'The offer letter has not been printed from this screen. An Update Offer Acceptance task will be generated for the recruiter.'
                ],
                close: true
              })
            }
          >
            Close Task
          </SaveButton>
        </>
      )
      body = (
        <>
          {details.offer?.reference ? (
            <p className='mb-2'>
              Letter reference: <strong>{details.offer.reference}</strong>
            </p>
          ) : (
            <p className='text-muted small mb-2'>A letter reference number is taken when the letter is first printed.</p>
          )}
          <iframe title='Offer letter' src={url} className='w-100 border rounded' style={{ height: '60vh' }} onLoad={() => setLetterOpened(true)} />
        </>
      )
    } else {
      const saved = details.offer?.accepted
      footer = (
        <>
          <SecondaryButton
            disabled={busy}
            onClick={() => {
              if (!acceptance.accepted || !acceptance.date) {
                setActionError('Please select the offer acceptance and the date.')
                return
              }
              run('save', { accepted: acceptance.accepted, date: acceptance.date }, {
                confirm: ['Update the offer acceptance?', acceptance.accepted === 'Y' ? 'The candidate will be listed under New Joinee.' : 'The offer will be recorded as declined.']
              })
            }}
          >
            Save Acceptance
          </SecondaryButton>
          <SaveButton
            isSubmitting={busy}
            disabled={!saved}
            onClick={() => run('submit', {}, { confirm: ['Close this task?', 'The offer acceptance can no longer be changed.'], close: true })}
          >
            Submit
          </SaveButton>
        </>
      )
      body = (
        <div className='row g-3'>
          <div className='col-md-4'>
            <label className='form-label'>
              Offer Accepted <span className='text-danger'>*</span>
            </label>
            <SDLReactSelect
              value={acceptance.accepted}
              options={ACCEPTANCE}
              placeholder='Please Select'
              isDisabled={busy}
              onChange={value => setAcceptance(current => ({ ...current, accepted: value || '' }))}
            />
          </div>
          <div className='col-md-4'>
            <label className='form-label'>
              Tentative Joining Date <span className='text-danger'>*</span>
            </label>
            <SDLCalendar
              value={parseDateValue(acceptance.date)}
              onChange={date => setAcceptance(current => ({ ...current, date: date ? toDateInputValue(date) : '' }))}
              allowAllDates
              disabled={busy}
            />
          </div>
          {!saved && <p className='text-muted small mb-0'>Save the acceptance before submitting.</p>}
        </div>
      )
    }
  }

  return (
    <RecruitmentModal
      titleId='recruitment-flow-title'
      title={details ? `${title} - ${details.candidate?.name || ''}` : title}
      size={taskId === TASK_PRINT || taskId === TASK_GENERATE || taskId === TASK_ANNEXURE ? 'xl' : 'lg'}
      loading={!details && !loadError}
      loadError={loadError}
      onClose={onClose}
      footer={footer}
    >
      {details && (
        <>
          <ActionError message={actionError} />
          <FlowSummary details={details} />
          {body}
        </>
      )}
    </RecruitmentModal>
  )
}

export default OfferTask
