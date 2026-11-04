import '../../assets/css/tenureChange.css'

/*
 * Common frame for the Exit task modals, matching the Tenure modals:
 * same backdrop, width, header (title + task identifiers) and footer.
 * The body shows a loader / load error until the task details arrive.
 */
const ExitModalShell = ({
  titleId,
  title,
  record,
  loading = false,
  loadError = '',
  actionError = '',
  onClose,
  footer,
  children
}) => (
  <div
    className='modal fade show d-block tenure-modal-backdrop'
    tabIndex='-1'
    role='dialog'
    aria-modal='true'
    aria-labelledby={titleId}
    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
  >
    <div
      className='modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable'
      style={{ width: '92%', maxWidth: '1200px' }}
    >
      <div className='modal-content shadow-lg border-0'>
        <div className='modal-header'>
          <div>
            <h5 className='modal-title mb-1' id={titleId}>
              {title}
            </h5>
            <small className='text-muted'>
              Separation ID: <strong>{record?.TRAN_CODE || '-'}</strong>
              <span className='mx-2'>|</span>
              Task ID: <strong>{record?.ID || '-'}</strong>
              <span className='mx-2'>|</span>
              Workflow Task: <strong>{record?.TASK_ID || '-'}</strong>
            </small>
          </div>
          <button
            type='button'
            className='close'
            onClick={onClose}
            aria-label='Close'
          >
            <span aria-hidden='true'>&times;</span>
          </button>
        </div>

        <div className='modal-body'>
          {loading ? (
            <div className='text-center py-5'>
              <span className='spinner-border' role='status' aria-label='Loading' />
              <div className='mt-2'>Loading task details...</div>
            </div>
          ) : loadError ? (
            <div className='alert alert-warning mb-0' role='alert'>
              {loadError}
            </div>
          ) : (
            <div className='tenure-change-page'>
              {actionError && (
                <div className='alert alert-danger' role='alert'>
                  {actionError}
                </div>
              )}
              {children}
            </div>
          )}
        </div>

        {footer && !loading && !loadError && (
          <div className='modal-footer'>{footer}</div>
        )}
      </div>
    </div>
  </div>
)

export default ExitModalShell
