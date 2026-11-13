import { useMemo, useState } from 'react'
import SaveButton from '../../../../../shared/components/buttons/SaveButton'
import SDLDataTable from '../../../../../shared/components/datatable/SDLDataTable'
import SDLSearch from '../../../../../shared/components/datatable/SDLSearch'
import RecruitmentModal from '../../../pages/recruitment/RecruitmentModal'
import { ActionError, CandidateName, CvLink, FlowSummary, SecondaryButton, StatusBadge } from './flowShared'
import { useFlowTask } from './useFlowTask'

const TASK_SEND_SUITABLE = 6
const DECISIONS = [
  { value: 'A', label: 'Shortlist' },
  { value: 'R', label: 'Reject' }
]

const matches = (candidate, query) => {
  const text = query.trim().toLowerCase()
  if (!text) return true
  return [candidate.name, candidate.email, candidate.mobile].some(value =>
    String(value || '').toLowerCase().includes(text)
  )
}

/* Send Suitable Candidates (6): applicants and verified candidates; shortlisted / rejected ones are locked. */
const SendSuitableBody = ({ details, selected, setSelected, busy }) => {
  const [query, setQuery] = useState('')
  const rows = useMemo(() => details.candidates.filter(c => matches(c, query)), [details.candidates, query])

  const toggle = id =>
    setSelected(current => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const columns = [
    {
      field: 'select',
      header: '',
      style: { width: '3rem' },
      body: row => {
        const locked = row.applicationStatus === 'A' || row.applicationStatus === 'R'
        return (
          <input
            type='checkbox'
            className='form-check-input'
            aria-label={`Select ${row.name}`}
            checked={row.applicationStatus === 'A' || selected.has(row.id)}
            disabled={locked || busy}
            onChange={() => toggle(row.id)}
          />
        )
      }
    },
    {
      field: 'name',
      header: 'Name',
      body: row => (
        <span className={row.applicationStatus === 'R' ? 'text-decoration-line-through text-muted' : ''}>
          <CandidateName id={row.id} name={row.name} />
        </span>
      )
    },
    { field: 'email', header: 'Email' },
    { field: 'mobile', header: 'Mobile' },
    { field: 'score', header: 'Suitability Score', style: { textAlign: 'center' } },
    { field: 'applicationStatus', header: 'Status', body: row => <StatusBadge status={row.applicationStatus} /> },
    { field: 'docPath', header: 'CV', body: row => <CvLink path={row.docPath} /> }
  ]

  return (
    <>
      <div className='d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2'>
        <div className='recruitment-search'>
          <SDLSearch value={query} onChange={setQuery} placeholder='Search Candidates...' />
        </div>
        <span className='text-muted small'>{selected.size} selected</span>
      </div>
      <SDLDataTable
        data={rows}
        columns={columns}
        emptyMessage='No candidates found'
        className='company-policies-grid fit-width-grid recruitment-grid'
        tableStyle={{ width: '100%' }}
        rowClassName={row => (row.applicationStatus === 'A' ? 'table-success' : row.applicationStatus === 'R' ? 'table-danger' : '')}
      />
    </>
  )
}

/* Shortlist Candidates (7): Shortlist / Reject each candidate sent for the request. */
const ShortlistBody = ({ details, decisions, setDecisions, busy }) => (
  <div className='table-responsive'>
    <table className='table table-bordered table-sm align-middle mb-0 recruitment-flow-table'>
      <thead>
        <tr>
          <th>Name</th>
          <th>Updated On</th>
          <th>Email</th>
          <th>Mobile</th>
          <th className='text-center'>CV</th>
          <th style={{ minWidth: '10rem' }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {details.candidates.length === 0 && (
          <tr>
            <td colSpan={6} className='text-center text-muted'>
              No candidates have been sent for this request.
            </td>
          </tr>
        )}
        {details.candidates.map(row => (
          <tr key={row.applicationId}>
            <td>
              <CandidateName id={row.id} name={row.name} />
            </td>
            <td>{row.updatedOn}</td>
            <td>{row.email}</td>
            <td>{row.mobile}</td>
            <td className='text-center'>
              <CvLink path={row.docPath} />
            </td>
            <td>
              {row.editable ? (
                <select
                  className='form-select form-select-sm'
                  aria-label={`Decision for ${row.name}`}
                  value={decisions[row.id] ?? (row.status === 'N' ? '' : row.status)}
                  disabled={busy}
                  onChange={event => setDecisions(current => ({ ...current, [row.id]: event.target.value }))}
                >
                  <option value=''>Please Select</option>
                  {DECISIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <StatusBadge status={row.status} />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

/* Tasks 6 and 7. Legacy send_suitable_cand.php / short_can.php. */
const CandidatesTask = ({ taskId, title, record, onClose, onSuccess }) => {
  const { details, loadError, busy, actionError, setActionError, run } = useFlowTask({ taskId, record, onSuccess })
  const [selected, setSelected] = useState(() => new Set())
  const [decisions, setDecisions] = useState({})
  const isSend = taskId === TASK_SEND_SUITABLE

  const send = async () => {
    if (selected.size === 0) {
      setActionError('Please select at least one candidate.')
      return
    }
    const done = await run('send', { candidate_ids: [...selected] }, {
      confirm: ['Send the selected candidates?', 'A Shortlist Candidates task will be generated for HR.']
    })
    if (done) setSelected(new Set())
  }

  const currentDecisions = () => {
    const values = {}
    details.candidates.forEach(row => {
      if (!row.editable) return
      const value = decisions[row.id] ?? (row.status === 'N' ? '' : row.status)
      if (value) values[row.id] = value
    })
    return values
  }

  const shortlist = async action => {
    const values = currentDecisions()
    if (Object.keys(values).length === 0) {
      setActionError('Please choose Shortlist or Reject for at least one candidate.')
      return
    }
    const done = await run(action, { decisions: values }, action === 'authorize'
      ? {
          confirm: ['Authorize the shortlist?', 'A Schedule Interview task will be generated for every shortlisted candidate.'],
          close: true
        }
      : {})
    if (done) setDecisions({})
  }

  return (
    <RecruitmentModal
      titleId='recruitment-flow-title'
      title={details ? `${title} - JOB ID #${details.request.id}` : title}
      size='xl'
      loading={!details && !loadError}
      loadError={loadError}
      onClose={onClose}
      footer={
        isSend ? (
          <SaveButton onClick={send} isSubmitting={busy} disabled={selected.size === 0}>
            Send Selected Candidates
          </SaveButton>
        ) : (
          <>
            <SecondaryButton onClick={() => shortlist('save')} disabled={busy}>
              Save
            </SecondaryButton>
            <SaveButton onClick={() => shortlist('authorize')} isSubmitting={busy}>
              Authorize
            </SaveButton>
          </>
        )
      }
    >
      {details && (
        <>
          <ActionError message={actionError} />
          <FlowSummary details={details} />
          {isSend ? (
            <SendSuitableBody details={details} selected={selected} setSelected={setSelected} busy={busy} />
          ) : (
            <ShortlistBody details={details} decisions={decisions} setDecisions={setDecisions} busy={busy} />
          )}
        </>
      )}
    </RecruitmentModal>
  )
}

export default CandidatesTask
