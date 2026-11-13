import { useEffect } from 'react'
import '../../assets/css/tenureChange.css'
import '../../assets/css/recruitment.css'

/* Modal frame of the recruitment pages, using the same backdrop as the task modals.
   size: 'md' for short forms, 'lg' for details, 'xl' for the candidate view.
   subtitle: optional small line under the title. */
const RecruitmentModal = ({
  titleId,
  title,
  size = 'md',
  loading = false,
  loadError = '',
  onClose,
  footer,
  subtitle,
  children
}) => {
  useEffect(() => {
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className='modal fade show d-block tenure-modal-backdrop'
      tabIndex='-1'
      role='dialog'
      aria-modal='true'
      aria-labelledby={titleId}
    >
      <div className={`modal-dialog modal-dialog-centered modal-dialog-scrollable recruitment-modal-${size}`}>
        <div className='modal-content shadow-lg border-0'>
          <div className='modal-header'>
            <div>
              <h5 className='modal-title mb-0' id={titleId}>
                {title}
              </h5>
              {subtitle && <small className='text-muted'>{subtitle}</small>}
            </div>
            <button type='button' className='close' onClick={onClose} aria-label='Close'>
              <span aria-hidden='true'>&times;</span>
            </button>
          </div>
          <div className='modal-body'>
            {loading && (
              <div className='text-center py-5'>
                <div className='spinner-border text-primary' role='status'>
                  <span className='visually-hidden'>Loading...</span>
                </div>
              </div>
            )}
            {!loading && loadError && <div className='alert alert-danger mb-0'>{loadError}</div>}
            {!loading && !loadError && children}
          </div>
          {!loading && !loadError && footer && <div className='modal-footer'>{footer}</div>}
        </div>
      </div>
    </div>
  )
}

export default RecruitmentModal
