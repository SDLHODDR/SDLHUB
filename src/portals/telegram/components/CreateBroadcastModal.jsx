import { useState } from "react";
import { getMockGroups } from "../services/mockData";

const CreateBroadcastModal = ({
  show,
  onClose,
  onSend,
}) => {
  const groups = getMockGroups();

  const initialState = {
    title: "",
    message: "",
    groupIds: [],
  };

  const [formData, setFormData] =
    useState(initialState);

  const handleToggle = (groupId) => {
    const exists =
      formData.groupIds.includes(groupId);

    setFormData({
      ...formData,
      groupIds: exists
        ? formData.groupIds.filter(
            (id) => id !== groupId
          )
        : [...formData.groupIds, groupId],
    });
  };

  const handleSubmit = () => {
    onSend(formData);

    setFormData(initialState);

    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal d-block telegram-modal">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content telegram-card border-0 shadow">
          <div className="modal-header">
            <h5 className="modal-title">
              Create Broadcast
            </h5>

            <button
              className="btn-close"
              onClick={onClose}
            />
          </div>

          <div className="modal-body">
            <div className="row g-3">

              <div className="col-md-12">
                <label className="form-label">
                  Title
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-md-12">
                <label className="form-label">
                  Message
                </label>

                <textarea
                  rows={5}
                  className="form-control"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      message: e.target.value,
                    })
                  }
                />
              </div>

             

            </div>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-light"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              Send Broadcast
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBroadcastModal;