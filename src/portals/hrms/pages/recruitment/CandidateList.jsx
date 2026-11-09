import { useCallback, useEffect, useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import BreadcrumbNav from '../../../../shared/components/BreadcrumbNav'
import SDLDataTable from '../../../../shared/components/datatable/SDLDataTable'
import SDLSearch from '../../../../shared/components/datatable/SDLSearch'
import { notifyError } from '../../../../shared/services/alertService'
import { exportCandidates, getCandidates } from '../../services/recruitmentService'
import CandidateIconActions from './CandidateIconActions'
import CandidateDetailsModal from './CandidateDetailsModal'
import CandidateScreenModal from './CandidateScreenModal'
import CandidateFollowUpModal from './CandidateFollowUpModal'
import useCandidateFollowUp from './useCandidateFollowUp'
import '../../../../shared/assets/css/companyPolicies.css'
import '../../assets/css/tenureChange.css'
import '../../assets/css/recruitment.css'

const PAGE_SIZE = 10
const SEARCH_DELAY_MS = 400

/* Candidate List (legacy candidate_info_list.php). 11,000+ rows, so the server pages and searches. */
const CandidateList = () => {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [first, setFirst] = useState(0)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [detailsId, setDetailsId] = useState(null)
  const [screenTarget, setScreenTarget] = useState(null)

  const reload = useCallback(() => setReloadKey(key => key + 1), [])
  const { followUpTarget, startFollowUp, closeFollowUp } = useCandidateFollowUp(reload)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setFirst(0)
    }, SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    getCandidates({ start: first, length: pageSize, search })
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        if (!active) return
        setRows(response.data?.rows || [])
        setTotal(response.data?.filtered || 0)
      })
      .catch(error => {
        if (active && !error?.cancelled) notifyError(error?.message || 'Unable to load the candidates.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [first, pageSize, search, reloadKey])

  const runExport = async format => {
    setExporting(true)
    try {
      await exportCandidates({ format, start: first, length: pageSize, search })
    } catch (error) {
      notifyError(error?.message || 'Unable to export the candidates.')
    } finally {
      setExporting(false)
    }
  }

  const columns = [
    { field: 'rowNumber', header: '#', style: { width: '60px', textAlign: 'center' } },
    {
      field: 'name',
      header: 'Name',
      body: row => (
        <>
          {row.name}
          {row.status === 'B' && <span className='badge bg-danger ms-2'>Blocked</span>}
        </>
      )
    },
    { field: 'mobile', header: 'Mobile', style: { width: '140px' } },
    { field: 'email', header: 'Email' },
    {
      field: 'date',
      header: 'Date',
      body: row => <span className='text-nowrap'>{row.date}</span>,
      style: { width: '120px' }
    },
    {
      header: 'Action',
      body: row => (
        <CandidateIconActions
          candidate={row}
          onView={candidate => setDetailsId(candidate.id)}
          onFollowUp={candidate => startFollowUp(candidate)}
          onScreen={setScreenTarget}
        />
      ),
      style: { width: '235px', textAlign: 'center' }
    }
  ]

  return (
    <>
      <div className='page-header' style={{ marginBottom: '8px' }}>
        <div className='page-title'>
          <h4>Candidate List</h4>
        </div>
        <BreadcrumbNav
          items={[
            { text: 'Home', link: '/hrms/dashboard' },
            { text: 'Recruitment', link: '#' },
            { text: 'Candidate List' }
          ]}
        />
      </div>

      <div className='row'>
        <div className='col-12 px-0'>
          <div className='card'>
            <div className='card-body'>
              <div className='d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3'>
                <div className='recruitment-search'>
                  <SDLSearch
                    value={searchInput}
                    onChange={setSearchInput}
                    placeholder='Search Name, Mobile or Email...'
                  />
                </div>
                <Dropdown>
                  <Dropdown.Toggle variant='secondary' size='sm' disabled={exporting || rows.length === 0}>
                    {exporting ? 'Exporting...' : 'Export'}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => runExport('xlsx')}>Excel (current page)</Dropdown.Item>
                    <Dropdown.Item onClick={() => runExport('csv')}>CSV (current page)</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <SDLDataTable
                data={rows}
                columns={columns}
                loading={loading}
                emptyMessage='No Candidates Found'
                className='company-policies-grid fit-width-grid recruitment-grid'
                dataKey='id'
                lazy
                paginator
                first={first}
                rows={pageSize}
                totalRecords={total}
                onPage={event => {
                  setFirst(event.first)
                  setPageSize(event.rows)
                }}
                paginatorTemplate='CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown'
                currentPageReportTemplate='Showing {first} to {last} of {totalRecords} entries'
                tableStyle={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {detailsId && <CandidateDetailsModal candidateId={detailsId} onClose={() => setDetailsId(null)} />}
      {screenTarget && (
        <CandidateScreenModal
          candidate={screenTarget}
          onClose={() => setScreenTarget(null)}
          onSaved={() => {
            setScreenTarget(null)
            reload()
          }}
        />
      )}
      {followUpTarget && (
        <CandidateFollowUpModal
          candidate={followUpTarget.candidate}
          onClose={closeFollowUp}
          onSaved={() => {
            closeFollowUp()
            reload()
          }}
        />
      )}
    </>
  )
}

export default CandidateList
