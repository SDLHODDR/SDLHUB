import { useParams } from 'react-router-dom'
import BreadcrumbNav from '../../portals/eportal/components/breadcrumb-nav/BreadcrumbNav'
import SDLDataTable from '../datatable/SDLDataTable'
import SDLSearch from '../datatable/SDLSearch'
import '../../portals/eportal/assets/css/companyPolicies.css'
import { formatDashDate } from '../../portals/eportal/utils/formatUtils'

import { useTenureAuthorizationHandler } from './useTenureAuthorizationHandler'
import { getTenureAuthorizationColumns } from './TenureAuthorizationColumns'
import TenureAuthorizationModal from './TenureAuthorizationModal'

// Map TASK_ID -> Page Title & Endpoints for Masters
const TENURE_TASK_CONFIG = {
  25: {
    title: 'Employee Tenure Change',
    modal: 'TenureChangeAssessment',
    id: 25,
    type: 'EMPTENURECHG'
  },

  26: {
    title: 'Tenure - CTC Change',
    modal: 'TenureCTCChange',
    id: 26,
    type: 'TENURECTCCHG'
  },

  27: {
    title: 'Tenure - CTC Approval',
    modal: 'TenureCTCApproval',
    id: 27,
    type: 'TENURECTCAPPR'
  },

  32: {
    title: 'Print Tenure Change Letter',
    modal: 'TenureChangeLetter',
    id: 32,
    type: 'TENURECHANGELETTER'
  }
  // 26: {
  //   title: "Employee Tenure Change",
  //   modal: "TenureChangeAssessment",
  //   id: 26,
  //   type: "EMPTENURECHG"
  // },
}

const TenureChangeAuthorization = () => {
  const { tid } = useParams()
  const config = TENURE_TASK_CONFIG[tid] || {
    title: 'Employee Tenure Change'
  }

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
  } = useTenureAuthorizationHandler(tid)

  const columns = getTenureAuthorizationColumns(formatDashDate, tid)

  return (
    <>
      <div className='page-header' style={{ marginBottom: '8px' }}>
        <div className='page-title'>
          <h4>{config.title}</h4>
        </div>
        <BreadcrumbNav
          items={[
            { text: 'Home', link: '/hrms/dashboard' },
            { text: 'Tenure Authorization', link: '#' },
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
                  emptyMessage='No Pending Tenure Requests Found'
                  className='company-policies-grid'
                  removableSort
                  onRowClick={e => {
                    const row = e?.data ?? e
                    //console.log("Row clicked:", row); // Check your console!
                    openModal(row)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <TenureAuthorizationModal
        config={config}
        show={showModal}
        record={selectedRecord}
        onClose={closeModal}
        onSuccess={refreshList}
      />
    </>
  )
}

export default TenureChangeAuthorization
