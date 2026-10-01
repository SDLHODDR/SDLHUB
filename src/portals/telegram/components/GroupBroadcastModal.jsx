import React, { useState, useEffect } from "react";

const GroupBroadcastModal = ({
  show,
  group,
  onClose,
  onSend,
}) => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (show) {
      setMessage("");
    }
  }, [show]);

  if (!show || !group) return null;

  const handleSubmit = () => {
    if (!message.trim()) {
      alert("Please enter message");
      return;
    }

    onSend({
      telegram_group_id:
        group.TELEGRAM_GROUP_ID || group.ID,
      message,
    });
  };

  return (
    <div className="modal show d-block" tabIndex="-1" >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header"> <h5 className="modal-title"> Broadcast Message</h5>
            <button type="button" className="btn-close custom-btn-close p-0" onClick={onClose} 
            aria-label="Close" >
              <i className="ti ti-x" />
            </button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label"> Group </label>
              <input type="text" className="form-control" value={group.TITLE} readOnly />
            </div>
            <div className="mb-3">
              <label className="form-label"> Message </label>
              <textarea rows="5" className="form-control" value={message}
                onChange={(e) => setMessage(e.target.value) }
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary me-2" onClick={onClose} > Cancel </button>
				    <button type="submit" className="btn btn-primary" onClick={handleSubmit} > Send </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupBroadcastModal;