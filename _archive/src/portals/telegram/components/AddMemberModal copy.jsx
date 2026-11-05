import { useState } from "react";
import { getMockGroups } from "../services/mockData";

const AddMemberModal = ({ show, onClose, onSave }) => {
  const initialState = {
    name: "",
    mobile: "",
    username: "",
    employeeCode: "",
    headquarters: "",
    groupIds: [],
  };

  const [formData, setFormData] = useState(initialState);

  const groups = getMockGroups();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGroupChange = (groupId) => {
    const exists = formData.groupIds.includes(groupId);

    setFormData({
      ...formData,
      groupIds: exists
        ? formData.groupIds.filter((id) => id !== groupId)
        : [...formData.groupIds, groupId],
    });
  };

  const handleSubmit = () => {
    onSave(formData);

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
              Add Member
            </h5>

            <button
              className="btn-close"
              onClick={onClose}
            />
          </div>

          <div className="modal-body">
            <div className="row g-3">
              {/* <div className="col-md-6">
                <label className="form-label">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div> */}

              <div className="col-md-6">
                <label className="form-label">
                  Region
                </label>
                <select className="select2 form-control" name="region" id="region" onChange={showEmp} >
                  <option value="">Select</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Pune">Pune</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Nashik">Nashik</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Username
                </label>

                <input
                  type="text"
                  name="username"
                  className="form-control"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Employee Code
                </label>

                <input
                  type="text"
                  name="employeeCode"
                  className="form-control"
                  value={formData.employeeCode}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-12">
                <label className="form-label">
                  Assign Groups
                </label>

                <div className="d-flex flex-wrap gap-2">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className="form-check"
                    >
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={formData.groupIds.includes(group.id)}
                        onChange={() =>
                          handleGroupChange(group.id)
                        }
                      />

                      <label className="form-check-label">
                        {group.group_name}
                      </label>
                    </div>
                  ))}
                </div>
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
              Save Member
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;