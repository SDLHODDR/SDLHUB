
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGroups } from "../services/telegramService";
import { getMembers } from "../services/telegramMemberService";

const SDLTelegramDashboard = () => {
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([getGroups(), getMembers()])
      .then(([groupResponse, memberResponse]) => {
        if (!isMounted) return;
        setGroups(Array.isArray(groupResponse?.data) ? groupResponse.data : []);
        setMembers(Array.isArray(memberResponse?.data) ? memberResponse.data : []);
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              "Unable to load Telegram data.",
          );
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const joinedMembers = members.filter(
    (member) => String(member.TELEGRAM_JOINED) === "1",
  ).length;
  const activeGroups = groups.filter(
    (group) => String(group.ACTIVE_FLAG) === "1",
  );

  return (
    <div className="telegram-page p-4">

      {/* PAGE HEADER */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">
          Telegram Dashboard
        </h4>

        <p className="text-muted mb-0">
          Monitor telegram groups, members and broadcasts
        </p>
      </div>

      {/* STATS */}
      <div className="row g-4 mb-4">

        <div className="col-md-3">
          <div className="telegram-card card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">
                Total Groups
              </div>

              <h3 className="fw-bold mb-0">
                {groups.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="telegram-card card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">
                Total Members
              </div>

              <h3 className="fw-bold mb-0">
                {members.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="telegram-card card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">
                Joined Members
              </div>

              <h3 className="fw-bold text-success mb-0">
                {joinedMembers}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="telegram-card card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="text-muted small mb-2">
                Pending Invites
              </div>

              <h3 className="fw-bold text-warning mb-0">
                {members.length - joinedMembers}
              </h3>
            </div>
          </div>
        </div>

      </div>

      {/* CONTENT */}
      <div className="row g-4">
        {error && (
          <div className="col-12">
            <div className="alert alert-danger mb-0" role="alert">{error}</div>
          </div>
        )}

        {/* GROUPS */}
        <div className="col-md-7">
          <div className="telegram-card card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pb-0">
              <h5 className="fw-semibold mb-0">
                Active Groups
              </h5>
            </div>

            <div className="card-body">

              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Group</th>
                      <th>Members</th>
                      <th>Description</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr><td colSpan="4" className="text-center py-4">Loading Telegram data...</td></tr>
                    ) : activeGroups.length ? activeGroups.map((group) => (
                      <tr key={group.ID}>
                        <td>
                          <div className="fw-semibold">
                            {group.TITLE}
                          </div>

                          <small className="text-muted">
                            {group.DESCRIPTION ?? group.description ?? ""}
                          </small>
                        </td>

                        <td>{group.member_count ?? 0}</td>

                        <td>{group.DESCRIPTION ?? group.description ?? "-"}</td>

                        <td>
                          <span className="badge bg-success">
                            Active
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="text-center text-muted py-4">No active groups</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>

        {/* MANAGEMENT LINKS */}
        <div className="col-md-5">
          <div className="telegram-card card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pb-0">
              <h5 className="fw-semibold mb-0">
                Telegram management
              </h5>
            </div>

            <div className="card-body d-flex flex-column gap-3">
              <p className="text-muted mb-0">
                Group broadcasts and direct messages are queued for delivery by the Telegram workers.
              </p>
              <Link className="btn btn-outline-primary align-self-start" to="/telegram/groups">
                <i className="ti ti-users me-2" aria-hidden="true" />Manage groups
              </Link>
              <Link className="btn btn-outline-primary align-self-start" to="/telegram/members">
                <i className="ti ti-user-cog me-2" aria-hidden="true" />Manage members
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default SDLTelegramDashboard;