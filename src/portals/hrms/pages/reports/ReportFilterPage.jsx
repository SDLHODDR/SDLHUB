import BreadcrumbNav from '../../../../shared/components/BreadcrumbNav'
import CancelButton from '../../../../shared/components/buttons/CancelButton'
import SaveButton from '../../../../shared/components/buttons/SaveButton'

/* Frame of a report filter page (legacy rept_admin.php): filters, then Get Data / Cancel. */
const ReportFilterPage = ({ title, loading, loadError, onGetData, onCancel, children }) => (
  <>
    <div className='page-header' style={{ marginBottom: '8px' }}>
      <div className='page-title'>
        <h4>{title}</h4>
      </div>
      <BreadcrumbNav items={[{ text: 'Home', link: '/hrms/dashboard' }, { text: 'Reports', link: '#' }, { text: title }]} />
    </div>
    <div className='row'>
      <div className='col-12 px-0'>
        <div className='card'>
          <div className='card-body'>
            {loading && (
              <div className='text-center py-4'>
                <div className='spinner-border text-primary' role='status'>
                  <span className='visually-hidden'>Loading...</span>
                </div>
              </div>
            )}
            {!loading && loadError && <div className='alert alert-danger mb-0'>{loadError}</div>}
            {!loading && !loadError && (
              <>
                <div className='row g-3'>{children}</div>
                <div className='d-flex justify-content-center gap-2 mt-4'>
                  <SaveButton onClick={onGetData}>Get Data</SaveButton>
                  <CancelButton onClick={onCancel} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  </>
)

export default ReportFilterPage
