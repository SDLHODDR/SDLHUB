const TenureAuthorizationModal = ({ show, record, onClose }) => {
  if (!show || !record) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tenure-authorization-title"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="tenure-authorization-title">
              Employee Tenure Change
            </h5>
            <button
              type="button"
              className="close"
              onClick={onClose}
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div className="modal-body">
            <p>Tenure authorization details will be integrated here.</p>
            <div className="mb-2">
              <strong>Employee:</strong> {record.EMP_CODE_FOR || record.EMP_NAME || "-"}
            </div>
            <div>
              <strong>Task:</strong> {record.TRAN_DESC || "-"}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenureAuthorizationModal;
