import { getMockGroups } from "../services/mockData";

const QRInviteModal = ({
  show,
  onClose,
  member,
}) => {
  const groups = getMockGroups();

  if (!show || !member) return null;

  const assignedGroups = groups.filter((group) =>
    member.groupIds.includes(group.id)
  );

  return (
    <div className="modal d-block telegram-modal">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content telegram-card border-0 shadow">
          <div className="modal-header">
            <h5 className="modal-title">
              QR Invite
            </h5>

            <button
              className="btn-close"
              onClick={onClose}
            />
          </div>

          <div className="modal-body">
            <div className="mb-4">
              <div className="fw-semibold">
                {member.name}
              </div>

              <small className="text-muted">
                {member.mobile}
              </small>
            </div>

            <div className="row g-4">
              {assignedGroups.map((group) => (
                <div
                  className="col-md-6"
                  key={group.id}
                >
                  <div className="border rounded p-3 text-center h-100">
                    <img
                      src={group.qr_code}
                      alt={group.group_name}
                      className="img-fluid mb-3 telegram-qr"
                    />

                    <h6 className="fw-semibold">
                      {group.group_name}
                    </h6>

                    <p className="small text-muted mb-2">
                      {group.region}
                    </p>

                    <a
                      href={group.invite_link}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-primary"
                    >
                      Open Invite
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {!assignedGroups.length && (
              <div className="text-center py-5 text-muted">
                No groups assigned
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRInviteModal;