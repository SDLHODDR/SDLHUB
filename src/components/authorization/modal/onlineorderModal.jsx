const OnlineorderModal = ({
  isOpen,
  onClose
}) => {

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show"></div>

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
      >
        <div className="modal-dialog add-centered">
          <div className="modal-content">

            {/* Header */}
            <div className="modal-header">
              <h4 className="modal-title">
                Add Sales
              </h4>

              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            {/* Body */}
            <div className="modal-body">
              Modal Content Here
            </div>

            {/* Footer */}
            <div className="modal-footer">

              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
              >
                Submit
              </button>

            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default OnlineorderModal;