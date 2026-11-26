import { useState } from 'react'
import { useParams } from 'react-router-dom'
import BreadcrumbNav from '../../../../shared/components/BreadcrumbNav'
import SDLDataTable from '../../../../shared/components/datatable/SDLDataTable'
import SDLSearch from '../../../../shared/components/datatable/SDLSearch'
import '../../../../shared/assets/css/companyPolicies.css'
import { formatDashDate } from '../../../../shared/utils/formatUtils'
import { getJoiningAuthorizationColumns } from '../joining/JoiningAuthorizationColumns'
import { useJoiningAuthorizationHandler } from '../joining/useJoiningAuthorizationHandler'
import AppraisalCtcModal from './AppraisalCtcModal'
import AppraisalLetterModal from './AppraisalLetterModal'
import AppraisalPromotionModal from './AppraisalPromotionModal'
import EmployeeAppraisalModal from './EmployeeAppraisalModal'

/* Appraisal tasks (TASK_TYPE A): each opens its own modal. */
const APPRAISAL_TASK_CONFIG = {
  46: { title: 'Employee Appraisal' },
  47: { title: 'Appraisal - CTC Change' },
  48: { title: 'Appraisal - CTC Approval' },
  49: { title: 'Appraisal - Employee Promotion' },
  50: { title: 'Appraisal - Employee Promotion Auth' },
  51: { title: 'Print Promotion Letter' },
  52: { title: 'Print Increment Letter' }
}
// Task -> modal.
const TASK_MODALS = {
  46: EmployeeAppraisalModal,
  47: AppraisalCtcModal,
  48: AppraisalCtcModal,
  49: AppraisalPromotionModal,
  50: AppraisalPromotionModal,
  51: AppraisalLetterModal,
  52: AppraisalLetterModal
}

const AppraisalAuthorization = () => {
  const { tid } = useParams()
  const config = APPRAISAL_TASK_CONFIG[tid]
  const [selected, setSelected] = useState(null)
  const { loading, searchQuery, setSearchQuery, filteredData, refresh } = useJoiningAuthorizationHandler(tid, config)
  const columns = getJoiningAuthorizationColumns(formatDashDate, tid)
  const title = config?.title || 'Appraisal'

  const TaskModal = TASK_MODALS[tid]
  const handleRowClick = record => {
    if (TaskModal && record?.ID) setSelected(record)
  }

  return (
    <>
      <div className='page-header'>
        <div className='page-title'>
          <h4>{title}</h4>
        </div>
        <BreadcrumbNav items={[{ text: 'Home', link: '/hrms/dashboard' }, { text: title }]} />
      </div>

      <div className='card'>
        <div className='card-body'>
          <div className='row mb-3'>
            <div className='col-lg-4 col-md-6 col-12'>
              <SDLSearch value={searchQuery} onChange={setSearchQuery} placeholder='Search Appraisals...' />
            </div>
          </div>
          <div className='company-policies-table'>
            <SDLDataTable
              data={filteredData}
              columns={columns}
              loading={loading}
              emptyMessage='No Tasks found'
              className='company-policies-grid'
              removableSort
              onRowClick={event => handleRowClick(event.data)}
            />
          </div>
        </div>
      </div>

      {selected && TaskModal && <TaskModal record={selected} onClose={() => setSelected(null)} onDone={refresh} />}
    </>
  )
}

export default AppraisalAuthorization
