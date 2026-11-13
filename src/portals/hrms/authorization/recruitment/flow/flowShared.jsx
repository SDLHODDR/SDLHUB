import { useState } from 'react'
import { APPLICATION_STATUSES, careersFileUrl } from '../../../pages/recruitment/recruitmentOptions'
import CandidateDetailsModal from '../../../pages/recruitment/CandidateDetailsModal'

export const Detail = ({ label, value, className = 'col-sm-6 col-lg-3' }) => (
  <div className={className}>
    <label className='form-label mb-1'>{label}</label>
    <div className='form-control-plaintext py-0 text-break'>{value || '-'}</div>
  </div>
)

export const StatusBadge = ({ status }) => {
  const item = APPLICATION_STATUSES[status]
  if (!item) return status ? <span>{status}</span> : null
  return <span className={`badge ${item.className}`}>{item.label}</span>
}

export const CvLink = ({ path }) => {
  const url = careersFileUrl(path)
  if (!url) return <span className='text-muted'>-</span>
  return (
    <a href={url} target='_blank' rel='noreferrer' title='Resume' aria-label='Open resume'>
      <i className='fas fa-file-pdf text-info' />
    </a>
  )
}

/** Name that opens the candidate details. */
export const CandidateName = ({ id, name }) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type='button' className='btn btn-link p-0 text-start' onClick={() => setOpen(true)}>
        {name}
      </button>
      {open && <CandidateDetailsModal candidateId={id} onClose={() => setOpen(false)} />}
    </>
  )
}

/** Request, candidate and interview shown at the top of every flow task. */
export const FlowSummary = ({ details, showInterview = true }) => {
  const { request, candidate, interview } = details
  return (
    <div className='row g-3 mb-3 pb-3 border-bottom'>
      {candidate?.applicationStatus === 'E' && (
        <div className='col-12'>
          <div className='alert alert-warning py-2 mb-0'>
            This candidate has already joined, so this task can no longer be processed.
          </div>
        </div>
      )}
      <Detail label='Department' value={request.department} />
      <Detail label='Designation' value={request.designation} />
      <Detail label='Division' value={request.division} />
      <Detail label='Location' value={request.location} />
      {request.remarks && <Detail label='Special Comments' value={request.remarks} className='col-12' />}
      {candidate && (
        <>
          <div className='col-sm-6 col-lg-3'>
            <label className='form-label mb-1'>Candidate</label>
            <div className='d-flex align-items-center gap-2'>
              <CandidateName id={candidate.id} name={candidate.name} />
              <CvLink path={candidate.docPath} />
            </div>
          </div>
          <Detail label='Email' value={candidate.email} />
          <Detail label='Mobile' value={candidate.mobile} />
          <div className='col-sm-6 col-lg-3'>
            <label className='form-label mb-1'>Status</label>
            <div>
              <StatusBadge status={candidate.applicationStatus} />
            </div>
          </div>
        </>
      )}
      {showInterview && interview && (
        <>
          <Detail label='Interview Date' value={interview.dateText} />
          <Detail label='Interview Time' value={interview.time} />
          <Detail label='Interview Mode' value={interview.modeText} />
          {interview.ctcOffer !== '' && <Detail label='CTC Offered (LPA)' value={interview.ctcOffer} />}
        </>
      )}
    </div>
  )
}

export const ActionError = ({ message }) =>
  message ? <div className='alert alert-danger py-2'>{message}</div> : null

/** Outline button for intermediate saves next to the primary action. */
export const SecondaryButton = ({ onClick, disabled = false, children }) => (
  <button type='button' className='btn btn-outline-primary' onClick={onClick} disabled={disabled}>
    {children}
  </button>
)
