import { useParams } from 'react-router-dom'
import BreadcrumbNav from '../../../../shared/components/BreadcrumbNav'
import SDLDataTable from '../../../../shared/components/datatable/SDLDataTable'
import SDLSearch from '../../../../shared/components/datatable/SDLSearch'
import { formatDashDate } from '../../../../shared/utils/formatUtils'
import { useExitAuthorizationHandler } from '../exit/useExitAuthorizationHandler'
import { getExitAuthorizationColumns } from '../exit/ExitAuthorizationColumns'
import RecruitmentTaskModal from './RecruitmentTaskModal'
import '../../../../shared/assets/css/companyPolicies.css'
import '../../assets/css/recruitment.css'

// HR_TASK_MASTER ids that have a screen here. Later tasks of the workflow are listed only.
const RECRUITMENT_TASKS = {
  2: 'Recruitment Request',
  5: 'Assign Recruiter'
}
const LISTED_ONLY_TASKS = {
  6: 'Send Suitable Candidates',
  7: 'Shortlist Candidates'
}

/* Recruitment tasks (legacy authorization.php -> recruitment_req.php with a task). */
const RecruitmentAuthorization = () => {
  const { tid } = useParams()
  const hasScreen = Boolean(RECRUITMENT_TASKS[tid])
  const title = RECRUITMENT_TASKS[tid] || LISTED_ONLY_TASKS[tid] || 'Recruitment Task'

  const {
    loading,
    searchQuery,
    setSearchQuery,
    filteredData,
    selectedRecord,
    showModal,
    openModal,
    closeModal,
    refreshList
  } = useExitAuthorizationHandler(tid)

  const columns = getExitAuthorizationColumns(formatDashDate, tid)

  return (
    <>
      <div className='page-header' style={{ marginBottom: '8px' }}>
        <div className='page-title'>
          <h4>{title}</h4>
        </div>
        <BreadcrumbNav
          items={[
            { text: 'Home', link: '/hrms/dashboard' },
            { text: 'Recruitment Authorization', link: '#' },
            { text: title }
          ]}
        />
      </div>

      <div className='row'>
        <div className='col-12 px-0'>
          <div className='card'>
            <div className='card-body'>
              {!hasScreen && (
                <div className='alert alert-warning py-2'>
                  This task has not been moved to SDL Hub yet. Please complete it in the old HRMS.
                </div>
              )}
              <div className='recruitment-search mb-3'>
                <SDLSearch value={searchQuery} onChange={setSearchQuery} placeholder='Search Requests...' />
              </div>
              <SDLDataTable
                data={filteredData}
                columns={columns}
                loading={loading}
                emptyMessage='No Pending Requests Found'
                className='company-policies-grid fit-width-grid recruitment-grid'
                tableStyle={{ width: '100%' }}
                removableSort
                sortField='CREATED_SORT'
                sortOrder={-1}
                onRowClick={hasScreen ? e => openModal(e?.data ?? e) : undefined}
              />
            </div>
          </div>
        </div>
      </div>

      {hasScreen && showModal && selectedRecord && (
        <RecruitmentTaskModal
          taskId={Number(tid)}
          title={title}
          record={selectedRecord}
          onClose={closeModal}
          onSuccess={() => {
            closeModal()
            refreshList()
            window.dispatchEvent(new Event('hrms-auth-tasks-changed'))
          }}
        />
      )}
    </>
  )
}

export default RecruitmentAuthorization
