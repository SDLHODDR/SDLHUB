import { useParams } from 'react-router-dom'
import BreadcrumbNav from '../../../../shared/components/BreadcrumbNav'
import SDLDataTable from '../../../../shared/components/datatable/SDLDataTable'
import SDLSearch from '../../../../shared/components/datatable/SDLSearch'
import '../../../../shared/assets/css/companyPolicies.css'
import { formatDashDate } from '../../../../shared/utils/formatUtils'

import { useExitAuthorizationHandler } from './useExitAuthorizationHandler'
import { getExitAuthorizationColumns } from './ExitAuthorizationColumns'
import ExitAuthorizationModal from './ExitAuthorizationModal'

// Map TASK_ID -> page title & modal (type is HR_TASK_MASTER.TASK_GRP)
const EXIT_TASK_CONFIG = {
  18: { title: 'Separation Request', id: 18, type: 'SEPARATION' },
  20: { title: 'Exit Interview', id: 20, type: 'EXIT_INT' },
  19: { title: 'Exit Activity', id: 19, type: 'EXIT_ACT' },
  23: { title: 'Deactivate Employee', id: 23, type: 'DEACT_EMP' },
  24: {
    title: 'Relieving and Experience Letter',
    id: 24,
    type: 'REL_EXP'
  }
}

const ExitAuthorization = () => {
  const { tid } = useParams()
  const config = EXIT_TASK_CONFIG[tid] || { title: 'Exit Authorization' }

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

  const columns = getExitAuthorizationColumns(
    formatDashDate,
    tid,
    filteredData[0]?.exit_arr_data,
    filteredData[0]?.join_arr_data
  )

  return (
    <>
      <div className='page-header' style={{ marginBottom: '8px' }}>
        <div className='page-title'>
          <h4>{config.title}</h4>
        </div>
        <BreadcrumbNav
          items={[
            { text: 'Home', link: '/hrms/dashboard' },
            { text: 'Exit Authorization', link: '#' },
            { text: config.title }
          ]}
        />
      </div>

      <div className='row'>
        <div className='col-12 px-0'>
          <div className='card'>
            <div className='card-body'>
              <div className='d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3'>
                <div
                  style={{
                    width: '330px',
                    minWidth: '330px',
                    maxWidth: '330px',
                    flexShrink: 0
                  }}
                >
                  <SDLSearch
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder='Search Requests...'
                    style={{
                      width: '330px',
                      minWidth: '330px',
                      maxWidth: '330px'
                    }}
                  />
                </div>
              </div>

              <div className='card-body pt-3'>
                <SDLDataTable
                  data={filteredData}
                  columns={columns}
                  loading={loading}
                  emptyMessage='No Pending Exit Requests Found'
                  className='company-policies-grid fit-width-grid'
                  tableStyle={{ width: '100%' }}
                  removableSort
                  sortField='CREATED_SORT'
                  sortOrder={-1}
                  onRowClick={e => openModal(e?.data ?? e)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ExitAuthorizationModal
        config={config}
        show={showModal}
        record={selectedRecord}
        onClose={closeModal}
        onSuccess={refreshList}
      />
    </>
  )
}

export default ExitAuthorization
