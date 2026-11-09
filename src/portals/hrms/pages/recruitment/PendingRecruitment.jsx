import { useCallback, useEffect, useMemo, useState } from 'react'
import BreadcrumbNav from '../../../../shared/components/BreadcrumbNav'
import SDLDataTable from '../../../../shared/components/datatable/SDLDataTable'
import SDLSearch from '../../../../shared/components/datatable/SDLSearch'
import EditButton from '../../../../shared/components/buttons/EditButton'
import { notifyError } from '../../../../shared/services/alertService'
import { getPendingRecruitments } from '../../services/recruitmentService'
import CandidateDetailsModal from './CandidateDetailsModal'
import CandidateFollowUpModal from './CandidateFollowUpModal'
import RequestFollowUpModal from './RequestFollowUpModal'
import RequestCandidates from './RequestCandidates'
import useCandidateFollowUp from './useCandidateFollowUp'
import '../../../../shared/assets/css/companyPolicies.css'
import '../../assets/css/tenureChange.css'
import '../../assets/css/recruitment.css'

/* Pending Recruitment List (legacy pending_recruitments.php): requests assigned to the user as recruiter. */
const PendingRecruitment = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRows, setExpandedRows] = useState({})
  const [detailsId, setDetailsId] = useState(null)
  const [requestFollowUp, setRequestFollowUp] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getPendingRecruitments()
      if (!response?.status) throw new Error(response?.message)
      setRequests(response.data?.requests || [])
    } catch (error) {
      if (!error?.cancelled) notifyError(error?.message || 'Unable to load the pending recruitments.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Async load; state is only set after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const { followUpTarget, startFollowUp, closeFollowUp } = useCandidateFollowUp(load)

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return requests
    return requests.filter(request =>
      [`#REQ${request.id}`, request.title, request.location, request.designation, request.tillDate].some(value =>
        String(value || '').toLowerCase().includes(query)
      )
    )
  }, [requests, searchQuery])

  const columns = [
    { expander: true, style: { width: '45px' } },
    { field: 'title', header: 'Title', body: row => `#REQ${row.id} - ${row.title}` },
    { field: 'location', header: 'Location' },
    { field: 'designation', header: 'Designation' },
    {
      field: 'tillDate',
      header: 'Till Date',
      body: row => <span className='text-nowrap'>{row.tillDate}</span>,
      style: { width: '120px' }
    },
    {
      header: 'Action',
      body: row => (
        <div className='d-flex justify-content-center'>
          <EditButton
            ariaLabel='Follow-Up'
            iconClassName='ti ti-search'
            onClick={() => setRequestFollowUp(row)}
          />
        </div>
      ),
      style: { width: '80px', textAlign: 'center' }
    }
  ]

  return (
    <>
      <div className='page-header' style={{ marginBottom: '8px' }}>
        <div className='page-title'>
          <h4>Pending Recruitment</h4>
        </div>
        <BreadcrumbNav
          items={[
            { text: 'Home', link: '/hrms/dashboard' },
            { text: 'Recruitment', link: '#' },
            { text: 'Pending Recruitment' }
          ]}
        />
      </div>

      <div className='row'>
        <div className='col-12 px-0'>
          <div className='card'>
            <div className='card-body'>
              <div className='recruitment-search mb-3'>
                <SDLSearch value={searchQuery} onChange={setSearchQuery} placeholder='Search Requests...' />
              </div>
              <SDLDataTable
                data={filtered}
                columns={columns}
                loading={loading}
                emptyMessage='No Pending Recruitments Found'
                className='company-policies-grid fit-width-grid recruitment-grid'
                dataKey='id'
                rows={50}
                expandedRows={expandedRows}
                onRowToggle={event => setExpandedRows(event.data)}
                rowExpansionTemplate={row => (
                  <RequestCandidates
                    candidates={row.candidates}
                    onView={candidate => setDetailsId(candidate.id)}
                    onFollowUp={candidate => startFollowUp(candidate, row.id)}
                  />
                )}
                tableStyle={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {detailsId && <CandidateDetailsModal candidateId={detailsId} onClose={() => setDetailsId(null)} />}
      {requestFollowUp && (
        <RequestFollowUpModal request={requestFollowUp} onClose={() => setRequestFollowUp(null)} />
      )}
      {followUpTarget && (
        <CandidateFollowUpModal
          candidate={followUpTarget.candidate}
          reqId={followUpTarget.reqId}
          onClose={closeFollowUp}
          onSaved={() => {
            closeFollowUp()
            load()
          }}
        />
      )}
    </>
  )
}

export default PendingRecruitment
