const InviteStatusBadge = ({ status }) => {
  const statusMap = {
    Joined: "success",
    Pending: "warning",
    Invited: "info",
    Failed: "danger",
  };

  return (
    <span className={`badge bg-${statusMap[status] || "secondary"}`}>
      {status}
    </span>
  );
};

export default InviteStatusBadge;