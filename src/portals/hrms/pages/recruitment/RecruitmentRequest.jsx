import { useCallback, useEffect, useMemo, useState } from 'react'
import BreadcrumbNav from '../../../../shared/components/BreadcrumbNav'
import SDLTabsComponent from '../../components/tabs/SDLTabsComponent'
import SDLDataTable from '../../../../shared/components/datatable/SDLDataTable'
import SDLSearch from '../../../../shared/components/datatable/SDLSearch'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import SDLCalendar from '../../../../shared/components/calendar/SDLCalendar'
import SaveButton from '../../../../shared/components/buttons/SaveButton'
import CancelButton from '../../../../shared/components/buttons/CancelButton'
import EditButton from '../../../../shared/components/buttons/EditButton'
import DeleteButton from '../../../../shared/components/buttons/DeleteButton'
import { parseDateValue, toDateInputValue } from '../../../../shared/utils/commonUtils'
import { confirmAction, notifyError, notifySuccess } from '../../../../shared/services/alertService'
import {
  cancelRecruitmentRequest,
  getOrganogramLocations,
  getRecruitmentRequest,
  getRecruitmentRequests,
  saveRecruitmentRequest
} from '../../services/recruitmentService'
import { REQUEST_STATUSES } from './recruitmentOptions'
import CandidateDetailsModal from './CandidateDetailsModal'
import RequestCandidates from './RequestCandidates'
import '../../../../shared/assets/css/companyPolicies.css'
import '../../assets/css/tenureChange.css'
import '../../assets/css/recruitment.css'

const EMPTY_FORM = { id: '', orgId: '', locationId: '', fillByDate: '', remarks: '', status: '' }
const EMPTY_POSITION = { positionCount: '', positionsOccupied: '', positionsInProgress: '', locations: [] }

const TABS = [
  { key: 'create', label: 'Create Request' },
  { key: 'requests', label: 'My Request' }
]

const RequiredMark = () => <span className='text-danger'> *</span>

/* Recruitment Request (legacy recruitment_req.php): raise a request for one position,
   save it as a draft and send it for HOD authorization (task 2). */
const RecruitmentRequest = () => {
  const [activeTab, setActiveTab] = useState('create')
  const [requests, setRequests] = useState([])
  const [organograms, setOrganograms] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRows, setExpandedRows] = useState({})
  const [form, setForm] = useState(EMPTY_FORM)
  const [position, setPosition] = useState(EMPTY_POSITION)
  const [positionLoading, setPositionLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [busyAction, setBusyAction] = useState('')
  const [detailsId, setDetailsId] = useState(null)

  const loadRequests = useCallback(async () => {
    setListLoading(true)
    try {
      const response = await getRecruitmentRequests()
      if (!response?.status) throw new Error(response?.message)
      setRequests(response.data?.requests || [])
      setOrganograms(response.data?.organograms || [])
    } catch (error) {
      if (!error?.cancelled) notifyError(error?.message || 'Unable to load the recruitment requests.')
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => {
    // Async load; state is only set after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRequests()
  }, [loadRequests])

  const loadPosition = async (orgId, recId) => {
    if (!orgId) {
      setPosition(EMPTY_POSITION)
      return
    }
    setPositionLoading(true)
    try {
      const response = await getOrganogramLocations(orgId, recId)
      if (!response?.status) throw new Error(response?.message)
      setPosition({ ...EMPTY_POSITION, ...response.data })
    } catch (error) {
      setPosition(EMPTY_POSITION)
      notifyError(error?.message || 'Unable to load the open locations.')
    } finally {
      setPositionLoading(false)
    }
  }

  const update = (field, value) => {
    setForm(current => ({ ...current, [field]: value }))
    setErrors(current => ({ ...current, [field]: '' }))
  }

  const changeOrganogram = orgId => {
    setForm(current => ({ ...current, orgId: orgId || '', locationId: '' }))
    setErrors(current => ({ ...current, orgId: '', locationId: '' }))
    loadPosition(orgId, form.id)
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setPosition(EMPTY_POSITION)
    setErrors({})
  }

  const openRequest = async id => {
    try {
      const response = await getRecruitmentRequest(id)
      if (!response?.status) throw new Error(response?.message)
      setForm({ ...EMPTY_FORM, ...response.data.request })
      setErrors({})
      setActiveTab('create')
      loadPosition(response.data.request.orgId, response.data.request.id)
    } catch (error) {
      notifyError(error?.message || 'Unable to load the recruitment request.')
    }
  }

  const validate = () => {
    const next = {}
    if (!form.orgId) next.orgId = 'Organogram is required.'
    if (!form.locationId) next.locationId = 'Open location is required.'
    if (!form.fillByDate) next.fillByDate = 'Fill by date is required.'
    else if (form.fillByDate < toDateInputValue(new Date())) next.fillByDate = 'Past dates cannot be selected.'
    if (!form.remarks.trim()) next.remarks = 'Remarks are required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async action => {
    if (!validate()) return
    if (action === 'send') {
      const confirmed = await confirmAction(
        'Send for authorization?',
        'This will generate a task for the HOD to authorize.'
      )
      if (!confirmed) return
    }
    setBusyAction(action)
    try {
      const response = await saveRecruitmentRequest({
        id: form.id || undefined,
        action,
        org_id: form.orgId,
        location_id: form.locationId,
        fill_by_date: form.fillByDate,
        remarks: form.remarks.trim()
      })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      if (action === 'send') {
        window.dispatchEvent(new Event('hrms-auth-tasks-changed'))
        resetForm()
        setActiveTab('requests')
      } else {
        setForm(current => ({ ...current, id: response.data?.id ?? current.id, status: 'N' }))
      }
      loadRequests()
    } catch (error) {
      notifyError(error?.message || 'Unable to save the recruitment request.')
    } finally {
      setBusyAction('')
    }
  }

  const cancelRequest = async id => {
    const confirmed = await confirmAction('Cancel this request?', "You won't be able to revert this!")
    if (!confirmed) return
    try {
      const response = await cancelRecruitmentRequest(id)
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      if (String(form.id) === String(id)) resetForm()
      loadRequests()
    } catch (error) {
      notifyError(error?.message || 'Unable to cancel the recruitment request.')
    }
  }

  // A request being edited may sit on an organogram that is now full, so keep it selectable.
  const organogramOptions = useMemo(() => {
    if (!form.orgId || organograms.some(option => String(option.value) === String(form.orgId))) {
      return organograms
    }
    return [{ value: form.orgId, label: `Organogram ${form.orgId}` }, ...organograms]
  }, [organograms, form.orgId])

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return requests
    return requests.filter(request =>
      [
        `#REQ${request.id}`,
        request.title,
        request.location,
        request.designation,
        REQUEST_STATUSES[request.status]?.label
      ].some(value => String(value || '').toLowerCase().includes(query))
    )
  }, [requests, searchQuery])

  const columns = [
    { expander: true, style: { width: '45px' } },
    {
      field: 'raisedOn',
      header: 'Raised on',
      body: row => <span className='text-nowrap'>{row.raisedOn}</span>,
      style: { width: '115px' }
    },
    { field: 'title', header: 'Title', body: row => `#REQ${row.id} - ${row.title}` },
    { field: 'location', header: 'Location' },
    { field: 'designation', header: 'Designation' },
    {
      field: 'tillDate',
      header: 'Till Date',
      body: row => <span className='text-nowrap'>{row.tillDate}</span>,
      style: { width: '115px' }
    },
    {
      field: 'status',
      header: 'Status',
      body: row => {
        const status = REQUEST_STATUSES[row.status]
        return <span className={`badge ${status?.className || 'bg-secondary'}`}>{status?.label || row.status}</span>
      },
      style: { width: '170px' }
    },
    {
      header: 'Action',
      body: row =>
        row.status === 'N' ? (
          <div className='d-flex justify-content-center gap-1'>
            <EditButton onClick={() => openRequest(row.id)} />
            <DeleteButton onClick={() => cancelRequest(row.id)} ariaLabel='Delete' />
          </div>
        ) : null,
      style: { width: '100px', textAlign: 'center' }
    }
  ]

  const fieldError = field =>
    errors[field] && <small className='text-danger d-block mt-1'>{errors[field]}</small>
  const busy = Boolean(busyAction)
  const noOpenLocation = Boolean(form.orgId) && !positionLoading && position.locations.length === 0

  return (
    <>
      <div className='page-header' style={{ marginBottom: '8px' }}>
        <div className='page-title'>
          <h4>Recruitment Request</h4>
        </div>
        <BreadcrumbNav
          items={[
            { text: 'Home', link: '/hrms/dashboard' },
            { text: 'Recruitment', link: '#' },
            { text: 'Recruitment Request' }
          ]}
        />
      </div>

      <div className='row'>
        <div className='col-12 px-0'>
          <div className='card'>
            <div className='card-body tenure-change-page'>
              <SDLTabsComponent tabs={TABS} selectedTab={activeTab} onTabChange={setActiveTab}>
              {activeTab === 'create' && (
                <>
                  <div className='row g-3'>
                    <div className='col-md-6'>
                      <label className='form-label'>Organogram<RequiredMark /></label>
                      <SDLReactSelect
                        value={form.orgId}
                        options={organogramOptions}
                        placeholder='Please Select Organogram'
                        isLoading={listLoading}
                        onChange={changeOrganogram}
                      />
                      {fieldError('orgId')}
                    </div>
                    <div className='col-md-6'>
                      <label className='form-label'>Open Location<RequiredMark /></label>
                      <SDLReactSelect
                        value={form.locationId}
                        options={position.locations}
                        placeholder='Please Select'
                        isLoading={positionLoading}
                        isDisabled={!form.orgId || noOpenLocation}
                        onChange={value => update('locationId', value || '')}
                      />
                      {noOpenLocation && (
                        <small className='text-danger d-block mt-1'>
                          This organogram has no open location to request.
                        </small>
                      )}
                      {fieldError('locationId')}
                    </div>
                    <div className='col-sm-6 col-lg-3'>
                      <label className='form-label' htmlFor='recruitment-position-count'>Position Count</label>
                      <input id='recruitment-position-count' className='form-control' readOnly value={position.positionCount} />
                    </div>
                    <div className='col-sm-6 col-lg-3'>
                      <label className='form-label' htmlFor='recruitment-occupied'>Positions Occupied</label>
                      <input id='recruitment-occupied' className='form-control' readOnly value={position.positionsOccupied} />
                    </div>
                    <div className='col-sm-6 col-lg-3'>
                      <label className='form-label' htmlFor='recruitment-in-progress'>Position In-progress</label>
                      <input id='recruitment-in-progress' className='form-control' readOnly value={position.positionsInProgress} />
                    </div>
                    <div className='col-sm-6 col-lg-3'>
                      <label className='form-label' htmlFor='recruitment-required'>Required Positions</label>
                      <input id='recruitment-required' className='form-control' readOnly value='1' />
                    </div>
                    <div className='col-md-4'>
                      <label className='form-label'>Fill By Date<RequiredMark /></label>
                      <SDLCalendar
                        value={parseDateValue(form.fillByDate)}
                        minDate={new Date()}
                        allowAllDates
                        inputClassName={errors.fillByDate ? 'is-invalid' : ''}
                        onChange={date => update('fillByDate', toDateInputValue(date))}
                      />
                      {fieldError('fillByDate')}
                    </div>
                    <div className='col-md-8'>
                      <label className='form-label' htmlFor='recruitment-remarks'>Remarks<RequiredMark /></label>
                      <input
                        id='recruitment-remarks'
                        className={`form-control${errors.remarks ? ' is-invalid' : ''}`}
                        maxLength={500}
                        value={form.remarks}
                        onChange={event => update('remarks', event.target.value)}
                      />
                      {fieldError('remarks')}
                    </div>
                  </div>
                  <div className='d-flex flex-wrap justify-content-end gap-2 mt-3'>
                    <SaveButton
                      onClick={() => submit('save')}
                      disabled={busy || noOpenLocation}
                      isSubmitting={busyAction === 'save'}
                      isEditing={Boolean(form.id)}
                                    />
                    {form.id && (
                      <button
                        type='button'
                        className='btn btn-success'
                        onClick={() => submit('send')}
                        disabled={busy || noOpenLocation}
                      >
                        {busyAction === 'send' ? 'Processing...' : 'Send For Authorization'}
                      </button>
                    )}
                    <CancelButton onClick={resetForm} disabled={busy} />
                  </div>
                </>
              )}

              {activeTab === 'requests' && (
                <>
                  <div className='recruitment-search mb-3'>
                    <SDLSearch value={searchQuery} onChange={setSearchQuery} placeholder='Search Requests...' />
                  </div>
                  <SDLDataTable
                    data={filteredRequests}
                    columns={columns}
                    loading={listLoading}
                    emptyMessage='No Recruitment Requests Found'
                    className='company-policies-grid fit-width-grid recruitment-grid'
                    dataKey='id'
                    rows={50}
                    expandedRows={expandedRows}
                    onRowToggle={event => setExpandedRows(event.data)}
                    rowExpansionTemplate={row => (
                      <RequestCandidates
                        candidates={row.candidates}
                        onView={candidate => setDetailsId(candidate.id)}
                      />
                    )}
                    tableStyle={{ width: '100%' }}
                  />
                </>
              )}
              </SDLTabsComponent>
            </div>
          </div>
        </div>
      </div>

      {detailsId && <CandidateDetailsModal candidateId={detailsId} onClose={() => setDetailsId(null)} />}
    </>
  )
}

export default RecruitmentRequest
