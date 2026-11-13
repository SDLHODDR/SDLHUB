import { useParams } from 'react-router-dom'
import BreadcrumbNav from '../../../../shared/components/BreadcrumbNav'
import SDLDataTable from '../../../../shared/components/datatable/SDLDataTable'
import SDLSearch from '../../../../shared/components/datatable/SDLSearch'
import { formatDashDate } from '../../../../shared/utils/formatUtils'
import { useExitAuthorizationHandler } from '../exit/useExitAuthorizationHandler'
import { getExitAuthorizationColumns } from '../exit/ExitAuthorizationColumns'
import RecruitmentTaskModal from './RecruitmentTaskModal'
import CandidatesTask from './flow/CandidatesTask'
import InterviewTask from './flow/InterviewTask'
import FeedbackTask from './flow/FeedbackTask'
import OfferTask from './flow/OfferTask'
import '../../../../shared/assets/css/companyPolicies.css'
import '../../assets/css/recruitment.css'

// HR_TASK_MASTER ids of the recruitment workflow and their screens.
const RECRUITMENT_TASKS = {
  2: 'Recruitment Request',
  5: 'Assign Recruiter'
}
// Tasks after Assign Recruiter (backend recruitmentFlowCommon.php).
const FLOW_TASKS = {
  6: ['Send Suitable Candidates', CandidatesTask],
  7: ['Shortlist Candidates', CandidatesTask],
  8: ['Schedule Interview', InterviewTask],
  16: ['Interview Confirmation', InterviewTask],
  11: ['Assign Interviewer And Recommender', InterviewTask],
  9: ['Interview Session', FeedbackTask],
  17: ['Interview Session as Recommender', FeedbackTask],
  10: ['Generate Offer', OfferTask],
  21: ['Annexure Approval', OfferTask],
  22: ['Print Offer Letter', OfferTask],
  12: ['Update Offer Acceptance', OfferTask]
}

/* Recruitment tasks (legacy authorization.php -> recruitment_req.php with a task). */
const RecruitmentAuthorization = () => {
  const { tid } = useParams()
  const [flowTitle, FlowTaskModal] = FLOW_TASKS[tid] || []
  const hasScreen = Boolean(RECRUITMENT_TASKS[tid] || FlowTaskModal)
  const title = RECRUITMENT_TASKS[tid] || flowTitle || 'Recruitment Task'

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

      {hasScreen && showModal && selectedRecord && (() => {
        const TaskModal = FlowTaskModal || RecruitmentTaskModal
        return (
          <TaskModal
            key={selectedRecord.ID}
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
        )
      })()}
    </>
  )
}

export default RecruitmentAuthorization
