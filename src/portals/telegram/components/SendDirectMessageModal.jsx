import { useState, useEffect } from "react";
import {
  getGroupMembers
} from "../services/telegramMemberService";

const SendDirectMessageModal = ({
  show,
  onClose,
  members,
  onSave,
}) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [memberFormData, setMemberFormData] = useState([]);

  useEffect(() => {
    const loadTelegramIds = async () => {
      try {
        setLoading(true);
        const res = await getGroupMembers(members);
        const formattedMembers = (res.data || []).map(
          (item) => ({ member_telegram_id: item.MEMBER_TELEGRAM_ID, })
        );
        setMemberFormData( formattedMembers );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      setMessage("");
      loadTelegramIds();
    }
  }, [show]);

  const handleSave = () => {
    if (!message.trim()) {
      alert("Please enter message");
      return;
    }
    onSave(message.trim(), memberFormData );
    onClose();
  };

  if (!show || !members?.length)
    return null;
    
  console.log("=========DM Modal Members========", members);

  return (
    <div className="modal d-block telegram-modal">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content telegram-card border-0 shadow">
          <div className="modal-header">
            <h5 className="modal-title"> Send Direct Message </h5>
            <button type="button" className="btn-close custom-btn-close p-0" onClick={onClose} aria-label="Close"> <i className="ti ti-x" /> </button>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <div className="fw-semibold">
                Send Message to{" "}
                {members.length} selected
                member
                {members.length > 1
                  ? "s"
                  : ""}
              </div>
              <div className="small text-muted mb-2"> Recipients: </div>
              <ul className="list-unstyled ms-3">
                {members.map(
                  (member) => (
                    <li key={member.id}> <span className="fw-semibold"> {member.name} </span>
                      {member.employeeCode ? ` — ${member.employeeCode}` : ""}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold"> Message </label>
              <textarea rows="6" className="form-control" value={message}
                onChange={(e) =>
                  setMessage( e.target.value )
                }
                placeholder="Enter message to send..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary me-2" onClick={onClose} > Cancel </button>
				    <button type="button" className="btn btn-primary" onClick={handleSave}> Send Message </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendDirectMessageModal;