import InviteStatusBadge from "./InviteStatusBadge";

const MemberTable = ({
  members,
  selectedIds = [],
  onSelect,
  onSelectAll,
  currentPage,
  setCurrentPage,
  total,
  pageSize,
}) => {
  const pageMemberIds = members.map((member) => member.id);
  const allSelected = pageMemberIds.length > 0 && pageMemberIds.every((id) => selectedIds.includes(id));
  console.log("============Members=============", members);

  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr>
            <th style={{ width: 40 }}>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" checked={allSelected} 
                  onChange={() => onSelectAll()} />
              </div>
            </th>
            <th>Member</th>
            <th>Mobile</th>
            <th>Status</th>
            <th>Group Status</th>
            <th>Groups</th>
            <th>Created On</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {members && members.length > 0 ? (
            members.map((member) => {
              const checked = selectedIds.includes(member.id);
              return (
                <tr key={member.id}>
                  <td>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" checked={checked} 
                      onChange={() => onSelect(member.id)} />
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="telegram-member-avatar bg-primary text-white d-flex align-items-center justify-content-center">
                        {member.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="fw-semibold"> {member.name} </div>
                        <small className="text-muted"> {member.username} </small>
                      </div>
                    </div>
                  </td>
                  <td>{member.mobile}</td>
                 <td>
                  {member.ACTIVE_FLAG === "1" ? (
                    <span className="badge badge-success badge-xs d-inline-flex align-items-center"> Active </span>
                  ) : (
                    <span className="badge badge-danger badge-xs d-inline-flex align-items-center"> Inactive </span>
                  )}
                  </td>
                  <td>
                    {member.TELEGRAM_JOINED === "1" ? (
                      <span className="badge badge-success badge-xs d-inline-flex align-items-center"> Joined </span>
                    ) : (
                      <span className="badge badge-danger badge-xs d-inline-flex align-items-center"> Pending </span>
                    )}
                  </td>
                  <td>
  <span
    className="badge bg-light text-dark border"
    title={member.GROUP_NAMES || "No Groups Assigned"}
    style={{ cursor: "pointer" }}
  >
    {member.GROUP_COUNT > 0
      ? `${member.GROUP_COUNT} Group${member.GROUP_COUNT > 1 ? "s" : ""}`
      : "No Groups"}
  </span>
</td>
                  <td>{member.joinedAt}</td>
                  <td>{member.TelegramjoinedAt}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No Data Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="d-flex justify-content-end p-3 gap-2">
        <button className="btn btn-sm btn-light" disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}> Prev </button>
        <span className="align-self-center"> Page {currentPage} of {Math.ceil(total / pageSize)} </span>
        <button className="btn btn-sm btn-light"
          disabled={currentPage >= Math.ceil(total / pageSize)}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
    // <MemberDMModal
    //   show={showDMModal}
    //   member={selectedMember}
    //   onClose={() => setShowDMModal(false)}
    //   onSend={handlePersonalMessage}
    // />
  );
};

export default MemberTable;