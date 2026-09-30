import { useEffect, useState } from "react";
import { getGroups } from "../services/telegramMemberService";

const AssignGroupModal = ({
  show,
  onClose,
  members,
  onSave,
}) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        if (!members?.length) return;

        setLoading(true);

        const response = await getGroups()

        console.log("GROUP RESPONSE", response);

        setGroups(response.data || []);
      } catch (error) {
        console.error("Failed to fetch groups", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [members]);

  const [selectedGroups, setSelectedGroups] = useState([]);

  useEffect(() => {
    if (members?.length) {
      setSelectedGroups([]);
    }
  }, [members]);

  const handleToggle = (groupId) => {
    const exists = selectedGroups.includes(groupId);

    if (exists) {
      setSelectedGroups((prev) =>
        prev.filter((id) => id !== groupId)
      );
    } else {
      setSelectedGroups((prev) => [...prev, groupId]);
    }
  };

  const handleSave = () => {
    onSave(members, selectedGroups);
    onClose();
  };

  if (!show || !members?.length) return null;

  return (
    <div className="modal d-block telegram-modal">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content telegram-card border-0 shadow">
          <div className="modal-header">
            <h5 className="modal-title">
              Assign Groups
            </h5>
            <button type="button" className="btn-close custom-btn-close p-0" onClick={onClose} aria-label="Close"> <i className="ti ti-x" /> </button>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <div className="fw-semibold">
                Assign Groups to {members.length} selected member{members.length > 1 ? "s" : ""}
              </div>
              <div className="small text-muted mb-2">
                Selected members:
              </div>
              <ul className="list-unstyled ms-3">
                {members.map((member) => (
                  <li key={member.id}>
                    <span className="fw-semibold">{member.name}</span>
                    {member.employeeCode ? ` — ${member.employeeCode}` : ""}
                  </li>
                ))}
              </ul>
            </div>

            <div className="row g-3">
              {loading ? (
                <div className="text-center py-4"> Loading groups... </div>
              ) : (
                <div className="row g-3">
                  {groups.map((group) => {
                    const checked = selectedGroups.includes(group.ID);

                    return (
                      <div key={group.ID} className="col-md-6" >
                        <div 
                          className={`border rounded p-3 cursor-pointer ${
                            checked
                              ? "border-primary bg-light"
                              : ""
                          }`}
                          onClick={() =>
                            handleToggle(group.ID)
                          }
                        >
                          <div className="form-check">
                            <input type="checkbox" className="form-check-input" checked={checked} readOnly />
                              <label className="form-check-label fw-semibold"> {group.TITLE} </label>
                          </div>
                          {/* <small className="text-muted"> {group.region} </small> */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}  
             
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary me-2" onClick={onClose} > Cancel </button>
				    <button type="button" className="btn btn-primary" onClick={handleSave}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignGroupModal;