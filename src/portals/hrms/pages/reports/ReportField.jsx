/* Labelled filter field with its validation message. */
const ReportField = ({ label, error, required = true, className = 'col-md-4 col-lg-3', children }) => (
  <div className={className}>
    <label className='form-label'>
      {label} {required && <span className='text-danger'>*</span>}
    </label>
    {children}
    {error && <small className='text-danger d-block mt-1'>{error}</small>}
  </div>
)

export default ReportField
