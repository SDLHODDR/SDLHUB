import React from "react";

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

  console.log("==========Members===============", members);
  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr>
            <th style={{ width: "40px" }}>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" checked={allSelected} onChange={onSelectAll} />
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

                  {/* Member */}
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="telegram-member-avatar bg-primary text-white d-flex align-items-center justify-content-center rounded-circle" style={{ width: "36px", height: "36px", fontWeight: "600", }} >
                        {member.name?.charAt(0)}
                      </div>

                      <div>
                        <div className="fw-semibold"> {member.name} </div>
                        <small className="text-muted"> {member.employeeCode} </small>
                      </div>
                    </div>
                  </td>
                  {/* Mobile */} <td>{member.mobile}</td>
                  {/* Status */}
                  <td> 
                    {member.ACTIVE_FLAG === "1" ? ( <span className="badge bg-success"> Active </span>
                    ) : ( <span className="badge bg-danger"> Inactive </span> )}
                  </td>
                  {/* Group Status */}
                  <td>
                    {member.TELEGRAM_JOINED === "1" ? ( <span className="badge bg-success"> Joined </span> ) : ( <span className="badge bg-warning text-dark"> Pending </span> )}
                  </td>
                  {/* Groups */}
                  <td>
                    <span className="badge bg-light text-dark border" title={ member.GROUP_NAMES?.trim() ? member.GROUP_NAMES : "No Groups Assigned" } style={{ cursor: "pointer", }} >
                      {member.GROUP_COUNT > 0 ? `${member.GROUP_COUNT} Group${ member.GROUP_COUNT > 1 ? "s" : "" }` : "No Groups"} </span>
                  </td>
                  {/* Created On */} <td>{member.joinedAt || "-"}</td>
                  {/* Joined On */} <td>{member.TelegramjoinedAt || "-"}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="8" className="text-center py-4">
                No Members Found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="d-flex justify-content-end align-items-center p-3 gap-3">
        <button className="btn btn-sm btn-light" disabled={currentPage === 1} 
        onClick={() => setCurrentPage(currentPage - 1)} > Prev </button>

        <span> Page {currentPage} of{" "} {Math.max(1, Math.ceil(total / pageSize))} </span>

        <button className="btn btn-sm btn-light" disabled={currentPage >= Math.ceil(total / pageSize)}
          onClick={() => setCurrentPage(currentPage + 1)} > Next </button>
      </div>
    </div>
  );
};

export default MemberTable;