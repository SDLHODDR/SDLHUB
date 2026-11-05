import { useEffect, useRef, useState } from "react";
// import Quill from "quill";
// import "quill/dist/quill.snow.css";

const GroupBroadcastModal = ({
  show,
  group,
  onClose,
  onSend,
}) => {

  const [formData, setFormData] = useState({
    title: "",
    message: "",
  });

  const handleSubmit = () => {
    onSend({
      groupId: group.ID,
      title: formData.title,
      message: formData.message,
    });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal d-block telegram-modal">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content telegram-card border-0 shadow">
          <div className="modal-header">
            <h5 className="modal-title"> Broadcast Message </h5>
            <button type="button" className="btn-close custom-btn-close p-0" onClick={onClose} aria-label="Close" > <i className="ti ti-x" /> </button>
          </div>
          <div className="modal-body">
            <div className="row g-3">
              <div className="col-md-12">
                <label className="form-label"> Group </label>
                <input type="text" className="form-control" value={group?.TITLE || ""} disabled />
              </div>
              <div className="col-md-12">
                <label className="form-label"> Title </label>
                <input className="form-control" value={formData.title} 
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="col-md-12">
                <label className="form-label"> Message </label>
                <textarea rows={5} className="form-control" value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary me-2" onClick={onClose} > Cancel </button>
            <button className="btn btn-primary" onClick={handleSubmit} > Send </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupBroadcastModal;