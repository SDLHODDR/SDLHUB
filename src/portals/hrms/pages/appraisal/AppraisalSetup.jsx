import { useCallback, useEffect, useMemo, useState } from 'react'
import BreadcrumbNav from '../../../../shared/components/BreadcrumbNav'
import SDLDataTable from '../../../../shared/components/datatable/SDLDataTable'
import SDLSearch from '../../../../shared/components/datatable/SDLSearch'
import EditButton from '../../../../shared/components/buttons/EditButton'
import { confirmAction, notifyError, notifySuccess } from '../../../../shared/services/alertService'
import SDLTabsComponent from '../../components/tabs/SDLTabsComponent'
import { getAppraisalSetup, getAppraisalSetups, processAppraisalSetup } from '../../services/appraisalService'
import AppraisalSetupForm from './AppraisalSetupForm'
import AppraisalQuestionsTab from './AppraisalQuestionsTab'
import AppraisalEmployeesTab from './AppraisalEmployeesTab'
import '../../../../shared/assets/css/companyPolicies.css'
import '../../assets/css/tenureChange.css'
import '../../assets/css/recruitment.css'
import '../../assets/css/appraisal.css'

const STATUS_BADGES = { N: 'bg-primary', P: 'bg-success', C: 'bg-secondary' }

/*
 * Appraisal Setup (legacy appraisal_setup.php): create an appraisal, add questions and organogram
 * employees while it is New, then Publish (each employee's appraiser gets an Employee Appraisal task)
 * and later Close it from the Appraisal List.
 */
const AppraisalSetup = () => {
  const [activeTab, setActiveTab] = useState('create')
  const [options, setOptions] = useState(null)
  const [appraisals, setAppraisals] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [detail, setDetail] = useState(null)
  const [busy, setBusy] = useState(false)

  // State is set only when the request settles, so the list can load from an effect.
  const loadList = useCallback(
    () =>
      getAppraisalSetups()
        .then(response => {
          if (!response?.status) throw new Error(response?.message)
          const { appraisals: rows, ...rest } = response.data
          setAppraisals(rows || [])
          setOptions(rest)
        })
        .catch(error => setLoadError(error?.message || 'Unable to load the appraisals.'))
        .finally(() => setListLoading(false)),
    []
  )

  useEffect(() => {
    loadList()
  }, [loadList])

  const loadDetail = useCallback(async id => {
    const response = await getAppraisalSetup(id)
    if (!response?.status) throw new Error(response?.message)
    setDetail(response.data)
    return response.data
  }, [])

  const openAppraisal = async (id, tab = 'create') => {
    try {
      await loadDetail(id)
      setActiveTab(tab)
    } catch (error) {
      notifyError(error?.message || 'Unable to load the appraisal.')
    }
  }

  const startNew = () => {
    setDetail(null)
    setActiveTab('create')
  }

  /** Runs one change; reloads the open appraisal and the list. Returns true when it was saved. */
  const run = async (payload, confirm) => {
    if (confirm && !(await confirmAction(...confirm))) return false
    setBusy(true)
    try {
      const response = await processAppraisalSetup({ id: detail?.appraisal.id, ...payload })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      const savedId = response.data?.id || detail?.appraisal.id
      if (savedId && payload.action !== 'close') await loadDetail(savedId)
      loadList()
      return true
    } catch (error) {
      notifyError(error?.message || 'Unable to save the appraisal.')
      return false
    } finally {
      setBusy(false)
    }
  }

  const listAction = async (row, action) => {
    const confirmText =
      action === 'publish'
        ? ['Publish this appraisal?', 'Appraisal tasks will be generated for the appraisers. The appraisal can no longer be changed.']
        : ['Close this appraisal?', "You won't be able to revert this!"]
    if (!(await confirmAction(...confirmText))) return
    setBusy(true)
    try {
      const response = await processAppraisalSetup({ action, id: row.id })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      if (detail?.appraisal.id === row.id) await loadDetail(row.id)
      loadList()
    } catch (error) {
      notifyError(error?.message || 'Unable to update the appraisal.')
    } finally {
      setBusy(false)
    }
  }

  const tabs = useMemo(
    () => [
      { key: 'create', label: 'Create Appraisal' },
      ...(detail
        ? [
            { key: 'questions', label: 'Question Master' },
            { key: 'employees', label: 'Appraisal Organogram Employee' }
          ]
        : []),
      { key: 'list', label: 'Appraisal List' }
    ],
    [detail]
  )

  const filtered = useMemo(() => {
    const text = searchQuery.trim().toLowerCase()
    if (!text) return appraisals
    return appraisals.filter(row =>
      [row.company, row.description, row.type, row.base, row.statusText].some(value => String(value || '').toLowerCase().includes(text))
    )
  }, [appraisals, searchQuery])

  const columns = [
    { field: 'company', header: 'Company' },
    { field: 'description', header: 'Appraisal Description' },
    { field: 'type', header: 'Appraisal Type' },
    { field: 'base', header: 'Appraisal Base' },
    { field: 'effectiveFrom', header: 'Effective From' },
    { field: 'effectiveTo', header: 'Effective To' },
    { field: 'publishDate', header: 'Publish Date' },
    { field: 'closeDate', header: 'Closed Date' },
    {
      field: 'statusText',
      header: 'Status',
      body: row => <span className={`badge ${STATUS_BADGES[row.status] || 'bg-secondary'}`}>{row.statusText}</span>
    },
    {
      field: 'actions',
      header: 'Action',
      body: row => (
        <div className='d-flex gap-2'>
          {row.status === 'N' ? (
            <EditButton ariaLabel='Edit' onClick={() => openAppraisal(row.id)} disabled={busy} />
          ) : (
            <EditButton ariaLabel='View' iconClassName='ti ti-eye' onClick={() => openAppraisal(row.id)} disabled={busy} />
          )}
          {row.status === 'N' && (
            <EditButton ariaLabel='Publish' iconClassName='ti ti-upload' onClick={() => listAction(row, 'publish')} disabled={busy} />
          )}
          {row.status === 'P' && (
            <EditButton
              ariaLabel='Close'
              iconClassName='ti ti-x'
              className='btn-outline-danger'
              onClick={() => listAction(row, 'close')}
              disabled={busy}
            />
          )}
        </div>
      )
    }
  ]

  return (
    <>
      <div className='page-header' style={{ marginBottom: '8px' }}>
        <div className='page-title'>
          <h4>Appraisal Setup</h4>
        </div>
        <BreadcrumbNav items={[{ text: 'Home', link: '/hrms/dashboard' }, { text: 'Appraisal', link: '#' }, { text: 'Appraisal Setup' }]} />
      </div>

      <div className='row'>
        <div className='col-12 px-0'>
          <div className='card'>
            <div className='card-body tenure-change-page'>
              {loadError && <div className='alert alert-danger'>{loadError}</div>}
              <SDLTabsComponent tabs={tabs} selectedTab={activeTab} onTabChange={setActiveTab}>
                {activeTab === 'create' &&
                  (options ? (
                    <AppraisalSetupForm
                      key={detail?.appraisal.id || 'new'}
                      options={options}
                      appraisal={detail?.appraisal}
                      busy={busy}
                      onSave={payload => run({ action: 'save', ...payload })}
                      onCancel={startNew}
                    />
                  ) : (
                    !loadError && <div className='text-muted'>Loading...</div>
                  ))}
                {activeTab === 'questions' && detail && <AppraisalQuestionsTab key={detail.appraisal.id} detail={detail} busy={busy} run={run} />}
                {activeTab === 'employees' && detail && <AppraisalEmployeesTab key={detail.appraisal.id} detail={detail} busy={busy} run={run} />}
                {activeTab === 'list' && (
                  <>
                    <div className='recruitment-search mb-3'>
                      <SDLSearch value={searchQuery} onChange={setSearchQuery} placeholder='Search Appraisals...' />
                    </div>
                    <SDLDataTable
                      data={filtered}
                      columns={columns}
                      loading={listLoading}
                      emptyMessage='No data found'
                      className='company-policies-grid fit-width-grid'
                      dataKey='id'
                      rows={25}
                      tableStyle={{ width: '100%' }}
                    />
                  </>
                )}
              </SDLTabsComponent>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AppraisalSetup
