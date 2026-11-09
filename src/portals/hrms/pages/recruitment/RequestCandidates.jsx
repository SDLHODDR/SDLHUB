import CandidateIconActions from './CandidateIconActions'
import { APPLICATION_STATUSES } from './recruitmentOptions'

/* Candidates under an expanded request, on Recruitment Request and Pending Recruitment. */
const RequestCandidates = ({ candidates, onView, onFollowUp }) => {
  if (candidates.length === 0) {
    return <p className='text-muted text-center my-2'>No candidates on this request yet.</p>
  }
  return (
    <div className='table-responsive'>
      <table className='table table-bordered align-middle mb-0 recruitment-detail-table'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th className='text-center'>Action</th>
            <th>Status</th>
            {onFollowUp && <th>Follow Up</th>}
          </tr>
        </thead>
        <tbody>
          {candidates.map(candidate => {
            const status = APPLICATION_STATUSES[candidate.applicationStatus]
            return (
              <tr key={candidate.id}>
                <td>{candidate.name}</td>
                <td>{candidate.email}</td>
                <td>
                  <CandidateIconActions
                    candidate={candidate}
                    onView={onView}
                    onFollowUp={onFollowUp}
                  />
                </td>
                <td>
                  {candidate.applicationStatus && (
                    <span className={`badge ${status?.className || 'bg-secondary'}`}>
                      {status?.label || candidate.applicationStatus}
                    </span>
                  )}
                </td>
                {onFollowUp && (
                  <td>
                    {status?.followUp && (
                      <button
                        type='button'
                        className='btn btn-sm btn-outline-primary text-nowrap'
                        onClick={() => onFollowUp(candidate)}
                      >
                        {status.followUp}
                      </button>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default RequestCandidates
