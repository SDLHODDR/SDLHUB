const ViewGroupModal = ({
  show,
  onClose,
  group,
}) => {
  if (!show || !group) return null;

  return (
    <>
      <div className="modal fade show d-block">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title"> Group Details </h5>
              <button type="button" className="btn-close custom-btn-close p-0" onClick={onClose} aria-label="Close" >
                <i className="ti ti-x" />
              </button>
            </div>
            <div className="modal-body">
              <div className="mb-3"> <strong>Group Name</strong> <div>{group.TITLE}</div> </div>
              <div className="mb-3"> <strong>Status</strong> <div>{group.ACTIVE_FLAG === "1" ? "Active" : "Inactive"}</div> </div>
              <div className="mb-3"> <strong>Description</strong> <div>{group.description ?? '-'}</div></div>
              <div className="mb-3"> <strong>Members</strong> <div>{group.member_count ?? 0}</div> </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default ViewGroupModal;