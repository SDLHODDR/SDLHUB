import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import CreateGroupModal from "../telegram/components/CreateGroupModal";
import SendDirectMessageModal from "../telegram/components/SendDirectMessageModal";
import GroupBroadcastModal from "../telegram/components/GroupBroadcastModal";
import {
  getDepartments,
  getDivisions,
  getGroups,
  getHRMSMembers,
  getMyEmployeeInvitations,
  getMembers,
  generateEmployeeInvitations,
  saveBroadCastMessage,
  saveMemberDM,
} from "./telegramNewService";
import "./telegram-new.css";

const readRows = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const TelegramNew = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [divisionId, setDivisionId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteEmployees, setInviteEmployees] = useState([]);
  const [invitationMode, setInvitationMode] = useState("form");
  const [myInvitations, setMyInvitations] = useState([]);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [busy, setBusy] = useState(false);

  const page = location.pathname.replace(/\/$/, "").split("/").pop() || "telegram-new";
  const groupIdFromUrl = new URLSearchParams(location.search).get("groupId") || "";
  const selectedInviteGroup = groups.find((group) => String(group.ID) === groupIdFromUrl);

  const refreshData = () => {
    setLoading(true);
    setError("");
    setRefreshKey((key) => key + 1);
  };

  useEffect(() => {
    let mounted = true;
    Promise.all([getGroups(), getMembers()])
      .then(([groupResponse, memberResponse]) => {
        if (!mounted) return;
        setGroups(readRows(groupResponse));
        setMembers(readRows(memberResponse));
      })
      .catch((requestError) => {
        if (mounted) setError(getErrorMessage(requestError, "Unable to load Telegram data."));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  useEffect(() => {
    if (page !== "invitations") return undefined;
    let mounted = true;
    Promise.all([getDivisions(), getDepartments()])
      .then(([divisionResponse, departmentResponse]) => {
        if (!mounted) return;
        setDivisions(readRows(divisionResponse));
        setDepartments(readRows(departmentResponse));
      })
      .catch((requestError) => {
        if (mounted) setError(getErrorMessage(requestError, "Unable to load organization filters."));
      });
    return () => {
      mounted = false;
    };
  }, [page]);

  useEffect(() => {
    if (page !== "invitations" || !divisionId || !departmentId) return undefined;
    let mounted = true;
    Promise.resolve()
      .then(() => {
        if (!mounted) return undefined;
        setEmployeeLoading(true);
        return getHRMSMembers({ divsn_id: divisionId, dept_id: departmentId });
      })
      .then((response) => {
        if (mounted && response) setEmployees(readRows(response));
      })
      .catch((requestError) => {
        if (mounted) setError(getErrorMessage(requestError, "Unable to load employees."));
      })
      .finally(() => {
        if (mounted) setEmployeeLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [page, divisionId, departmentId]);

  useEffect(() => {
    if (page !== "invitations" || invitationMode !== "list") return undefined;
    let mounted = true;
    getMyEmployeeInvitations()
      .then((response) => {
        if (mounted) setMyInvitations(readRows(response?.data));
      })
      .catch((requestError) => {
        if (mounted) setError(getErrorMessage(requestError, "Unable to load your invitations."));
      })
      .finally(() => {
        if (mounted) setInvitationLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [page, invitationMode]);

  const activeGroups = groups.filter((group) => String(group.ACTIVE_FLAG) === "1");
  const joinedMembers = members.filter((member) => String(member.TELEGRAM_JOINED) === "1");
  const filteredGroups = useMemo(() => groups.filter((group) => {
    const term = search.trim().toLowerCase();
    const text = `${group.TITLE || ""} ${group.GROUP_CODE || ""}`.toLowerCase();
    const groupStatus = String(group.ACTIVE_FLAG) === "1" ? "Active" : "Inactive";
    return (!term || text.includes(term)) && (!status || status === groupStatus);
  }), [groups, search, status]);
  const filteredEmployees = useMemo(() => employees.filter((employee) => {
    const term = inviteSearch.trim().toLowerCase();
    const text = `${employee.EMP_CODE || ""} ${employee.FNAME || ""} ${employee.LNAME || ""}`.toLowerCase();
    return !term || text.includes(term);
  }), [employees, inviteSearch]);

  const openInvitations = (group) => {
    navigate(`/telegram-new/invitations?groupId=${encodeURIComponent(group.ID)}`);
  };

  const handleSendDm = async (message, recipients) => {
    setBusy(true);
    try {
      const response = await saveMemberDM({ member_data: recipients, message });
      if (response?.success === false) throw new Error(response.message || "Unable to queue message.");
      setSelectedMember(null);
      await Swal.fire({ icon: "success", title: "Request accepted", text: response?.message || "The message request was accepted by the backend." });
    } catch (requestError) {
      await Swal.fire({ icon: "error", title: "Message request failed", text: getErrorMessage(requestError, "Unable to queue message.") });
    } finally {
      setBusy(false);
    }
  };

  const handleSendBroadcast = async (payload) => {
    setBusy(true);
    try {
      const response = await saveBroadCastMessage(payload);
      if (!response?.success) throw new Error(response?.message || "Unable to queue broadcast.");
      setSelectedGroup(null);
      await Swal.fire({ icon: "success", title: "Request accepted", text: response.message || "The broadcast request was accepted by the backend." });
    } catch (requestError) {
      await Swal.fire({ icon: "error", title: "Broadcast request failed", text: getErrorMessage(requestError, "Unable to queue broadcast.") });
    } finally {
      setBusy(false);
    }
  };

  const handleInviteEmployeeToggle = (employeeCode) => {
    setInviteEmployees((current) => current.includes(employeeCode)
      ? current.filter((code) => code !== employeeCode)
      : [...current, employeeCode]);
  };

  const handleGenerateInvitations = async () => {
    setBusy(true);
    try {
      const selectedEmployees = employees
        .filter((employee) => inviteEmployees.includes(employee.EMP_CODE))
        .map((employee) => ({
          employee_code: employee.EMP_CODE,
          employee_name: `${employee.FNAME || ""} ${employee.LNAME || ""}`.trim(),
          mobile_number: employee.CELL || "",
        }));
      const response = await generateEmployeeInvitations({
        group_id: selectedInviteGroup?.TELEGRAM_GROUP_ID,
        employees: selectedEmployees,
        expiry_days: 30,
        usage_limit: 1,
      });
      if (!response.success) throw new Error(response.message || "Unable to generate invitations.");
      const results = response.data?.results || [];
      const generatedCount = results.filter((item) => item.status === "GENERATED" || item.status === "ACTIVE").length;
      setInviteEmployees([]);
      await Swal.fire({
        icon: results.some((item) => item.status === "FAILED") ? "warning" : "success",
        title: "Invitation requests processed",
        text: `${generatedCount} invitation link${generatedCount === 1 ? "" : "s"} ready. ${results.length - generatedCount} already joined or failed.`,
      });
    } catch (requestError) {
      await Swal.fire({ icon: "error", title: "Invitation generation failed", text: getErrorMessage(requestError, "Unable to generate invitations.") });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="telegram-new container-fluid py-4">
      <header className="telegram-new__header">
        <div>
          <p className="telegram-new__eyebrow">SDLHUB / MANAGEMENT</p>
          <h1>Telegram</h1>
          <p className="text-muted mb-0">Groups, employee memberships and message operations.</p>
        </div>
        <div className="d-flex gap-2">
          {page === "telegram-new" && <button type="button" className="btn btn-primary" onClick={() => setShowCreateGroup(true)}><i className="ti ti-plus me-1" aria-hidden="true" />Create group</button>}
          <button type="button" className="btn btn-outline-secondary" onClick={refreshData} disabled={loading} aria-label="Refresh Telegram data">
            <i className="ti ti-refresh me-1" aria-hidden="true" />Refresh
          </button>
        </div>
      </header>

      <nav className="telegram-new__nav" aria-label="Telegram management">
        {[["telegram-new", "Dashboard"], ["groups", "Groups"], ["members", "Members"], ["messages", "Messages"], ["invitations", "Invitations"]].map(([path, label]) => (
          <Link key={path} className={page === path ? "is-active" : ""} to={path === "telegram-new" ? "/telegram-new/" : `/telegram-new/${path}`}>{label}</Link>
        ))}
      </nav>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {page === "telegram-new" && (
        <>
          <section className="telegram-new__metrics" aria-label="Telegram summary">
            <Metric label="Active groups" value={loading ? "..." : activeGroups.length} icon="ti-users" onClick={() => navigate("/telegram-new/groups")} />
            <Metric label="Inactive groups" value={loading ? "..." : groups.length - activeGroups.length} icon="ti-users-minus" onClick={() => navigate("/telegram-new/groups")} />
            <Metric label="Joined members" value={loading ? "..." : joinedMembers.length} icon="ti-user" onClick={() => navigate("/telegram-new/members")} />
            <Metric label="Pending invitations" value="Unavailable" icon="ti-link-off" onClick={() => navigate("/telegram-new/invitations")} />
            <Metric label="Message delivery" value="Unavailable" icon="ti-message-circle" onClick={() => navigate("/telegram-new/messages")} />
          </section>
          <section className="telegram-new__panel">
            <div className="telegram-new__section-heading"><div><h2>Active groups</h2><p className="text-muted mb-0">Current groups and confirmed membership counts from the existing API.</p></div><Link className="btn btn-sm btn-outline-primary" to="/telegram-new/groups">View groups</Link></div>
            <GroupRows groups={activeGroups.slice(0, 6)} loading={loading} emptyText="No active groups were returned." onInvite={openInvitations} onBroadcast={setSelectedGroup} />
          </section>
          <section className="telegram-new__panel">
            <div className="telegram-new__section-heading"><div><h2>Recently joined members</h2><p className="text-muted mb-0">Based on membership records returned by the existing API.</p></div><Link className="btn btn-sm btn-outline-primary" to="/telegram-new/members">View members</Link></div>
            <div className="table-responsive"><table className="table align-middle telegram-new__table"><thead><tr><th>Employee</th><th>Employee code</th><th>Joined</th></tr></thead><tbody>
              {loading ? <tr><td colSpan="3" className="text-center py-4">Loading members...</td></tr> : joinedMembers.slice(0, 5).map((member) => <tr key={member.ID}><td>{`${member.FIRST_NAME || ""} ${member.LAST_NAME || ""}`.trim() || "Employee"}</td><td>{member.EMPLOYEE_CODE || "—"}</td><td>{member.JOINED_ON || "—"}</td></tr>)}
              {!loading && joinedMembers.length === 0 && <tr><td colSpan="3" className="text-center text-muted py-4">No joined memberships were returned.</td></tr>}
            </tbody></table></div>
          </section>
        </>
      )}

      {page === "groups" && (
        <section className="telegram-new__panel">
          <div className="telegram-new__section-heading"><div><h2>Groups</h2><p className="text-muted mb-0">Create groups through PHP, which calls the configured MTProto service.</p></div><button type="button" className="btn btn-primary" onClick={() => setShowCreateGroup(true)}><i className="ti ti-plus me-1" aria-hidden="true" />Create group</button></div>
          <div className="telegram-new__filters"><input className="form-control" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search group name or code" aria-label="Search groups" /><select className="form-select" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter group status"><option value="">All statuses</option><option>Active</option><option>Inactive</option></select></div>
          <GroupRows groups={filteredGroups} loading={loading} emptyText="No groups match these filters." onInvite={openInvitations} onBroadcast={setSelectedGroup} />
        </section>
      )}

      {page === "members" && (
        <section className="telegram-new__panel">
          <div className="telegram-new__section-heading"><div><h2>Members</h2><p className="text-muted mb-0">Employee status and Telegram group membership are shown separately.</p></div></div>
          <div className="telegram-new__metrics telegram-new__metrics--members">
            <Metric label="Active employees" value={loading ? "..." : members.filter((member) => String(member.ACTIVE_FLAG) === "1").length} icon="ti-user-check" />
            <Metric label="Joined memberships" value={loading ? "..." : joinedMembers.length} icon="ti-user" />
            <Metric label="Pending invitations" value="Unavailable" icon="ti-link-off" />
          </div>
          <div className="table-responsive"><table className="table align-middle telegram-new__table"><thead><tr><th>Employee</th><th>Employee code</th><th>Employee status</th><th>Telegram membership</th><th>Groups</th><th>Joined</th><th>Action</th></tr></thead><tbody>
            {loading ? <tr><td colSpan="7" className="text-center py-4">Loading members...</td></tr> : members.length ? members.map((member) => {
              const displayMember = {
                id: member.ID,
                name: `${member.FIRST_NAME || ""} ${member.LAST_NAME || ""}`.trim() || "Employee",
                employeeCode: member.EMPLOYEE_CODE,
                mobile: member.MOBILE_NUMBER,
              };
              const isJoined = String(member.TELEGRAM_JOINED) === "1";
              return <tr key={member.ID}><td>{displayMember.name}</td><td>{displayMember.employeeCode || "—"}</td><td><Status value={String(member.ACTIVE_FLAG) === "1" ? "Active" : "Inactive"} positive={String(member.ACTIVE_FLAG) === "1"} /></td><td><Status value={isJoined ? "Joined" : "Not joined"} positive={isJoined} /></td><td>{member.GROUP_NAMES || member.GROUP_COUNT || "—"}</td><td>{member.JOINED_ON || "—"}</td><td><button type="button" className="btn btn-sm btn-outline-primary" disabled={!member.ID || busy} onClick={() => setSelectedMember(displayMember)}>Send DM</button></td></tr>;
            }) : <tr><td colSpan="7" className="text-center text-muted py-4">No member records were returned.</td></tr>}
          </tbody></table></div>
        </section>
      )}

      {page === "messages" && (
        <section className="telegram-new__panel">
          <div className="telegram-new__section-heading"><div><h2>Messages</h2><p className="text-muted mb-0">Direct messages and group broadcasts are submitted through existing PHP queue endpoints.</p></div></div>
          <div className="telegram-new__message-actions">
            <div><i className="ti ti-user-message" aria-hidden="true" /><h3>Personal message</h3><p>Open a member record to compose a direct-message request.</p><Link className="btn btn-outline-primary" to="/telegram-new/members">Open members</Link></div>
            <div><i className="ti ti-speakerphone" aria-hidden="true" /><h3>Group broadcast</h3><p>Open a group to compose and submit a broadcast request.</p><Link className="btn btn-outline-primary" to="/telegram-new/groups">Open groups</Link></div>
          </div>
          <div className="telegram-new__notice" role="status"><strong>Message history and delivery status are not exposed by the current PHP API.</strong><span>A queue submission is not confirmation that Telegram sent, delivered, or read a message.</span></div>
        </section>
      )}

      {page === "invitations" && (
        <section className="telegram-new__panel">
          <div className="telegram-new__section-heading"><div><h2>Invitations</h2><p className="text-muted mb-0">Generate employee-specific group links or review your invitations.</p></div></div>
          <div className="telegram-new__invitation-tabs" role="tablist" aria-label="Invitation views">
            <button type="button" role="tab" aria-selected={invitationMode === "form"} className={invitationMode === "form" ? "is-active" : ""} onClick={() => setInvitationMode("form")}>Generate invitations</button>
            <button type="button" role="tab" aria-selected={invitationMode === "list"} className={invitationMode === "list" ? "is-active" : ""} onClick={() => { setInvitationLoading(true); setInvitationMode("list"); }}>My invitations</button>
          </div>
          {invitationMode === "form" ? (
          <div className="telegram-new__invite-form">
            <label className="form-label" htmlFor="telegram-invite-group">Telegram group</label>
            <select id="telegram-invite-group" className="form-select" value={groupIdFromUrl} onChange={(event) => navigate(`/telegram-new/invitations${event.target.value ? `?groupId=${encodeURIComponent(event.target.value)}` : ""}`)}><option value="">Select a group</option>{groups.map((group) => <option key={group.ID} value={group.ID}>{group.TITLE}</option>)}</select>
            {selectedInviteGroup && <p className="small text-muted mt-1">Telegram group ID: {selectedInviteGroup.TELEGRAM_GROUP_ID || "not available"}</p>}
            <div className="telegram-new__filters telegram-new__filters--org">
              <label><span className="form-label">Division</span><select className="form-select" value={divisionId} onChange={(event) => { setDivisionId(event.target.value); setDepartmentId(""); setEmployees([]); setInviteEmployees([]); }}><option value="">Select division</option>{divisions.map((division) => <option key={division.DIVSN_ID} value={division.DIVSN_ID}>{division.DIVSN_DESC}</option>)}</select></label>
              <label><span className="form-label">Department</span><select className="form-select" value={departmentId} onChange={(event) => { setDepartmentId(event.target.value); setEmployees([]); setInviteEmployees([]); }}><option value="">Select department</option>{departments.map((department) => <option key={department.DEPT_ID} value={department.DEPT_ID}>{department.DEPT_DESC}</option>)}</select></label>
            </div>
            <label className="form-label" htmlFor="telegram-invite-search">Find employees</label>
            <input id="telegram-invite-search" className="form-control" value={inviteSearch} onChange={(event) => setInviteSearch(event.target.value)} placeholder="Search by employee name or code" />
            <div className="telegram-new__employee-list" aria-label="Employees">
              {employeeLoading ? <p className="p-3 text-muted mb-0">Loading employees...</p> : !divisionId || !departmentId ? <p className="p-3 text-muted mb-0">Select a division and department to load employees.</p> : filteredEmployees.length ? filteredEmployees.map((employee) => {
                const employeeCode = employee.EMP_CODE;
                const employeeName = `${employee.FNAME || ""} ${employee.LNAME || ""}`.trim() || "Employee";
                const checked = inviteEmployees.includes(employeeCode);
                return <label className="telegram-new__employee" key={employeeCode}><input type="checkbox" checked={checked} onChange={() => handleInviteEmployeeToggle(employeeCode)} /><span><strong>{employeeName}</strong><small>{employeeCode} · {employee.DIVSN_DESC} · {employee.DEPT_DESC}</small></span></label>;
              }) : <p className="p-3 text-muted mb-0">No employees were returned for these filters.</p>}
            </div>
            <div className="telegram-new__invite-settings"><label>Expiry<select className="form-select" value="30" disabled><option value="30">30 days</option></select></label><label>Uses per link<input className="form-control" value="1" readOnly aria-label="Uses per invitation link" /></label></div>
            <div className="telegram-new__notice" role="note"><strong>Each selected employee receives a unique, single-use Telegram link.</strong><span>Links expire after 30 days. Telegram join updates are matched against the individual link before the employee membership is marked joined.</span></div>
            <button type="button" className="btn btn-primary" onClick={handleGenerateInvitations} disabled={!groupIdFromUrl || inviteEmployees.length === 0 || busy}>{busy ? "Generating..." : "Generate invitation links"}</button>
          </div>
          ) : (
            <div className="table-responsive"><table className="table align-middle telegram-new__table"><thead><tr><th>Group</th><th>Invite link</th><th>Expires</th><th>Status</th></tr></thead><tbody>
              {invitationLoading ? <tr><td colSpan="4" className="text-center py-4">Loading invitations...</td></tr> : myInvitations.length ? myInvitations.map((invitation) => <tr key={invitation.ID}><td>{invitation.GROUP_NAME || "Telegram group"}</td><td>{invitation.INVITE_LINK && String(invitation.IS_ACTIVE) === "1" ? <a href={invitation.INVITE_LINK} target="_blank" rel="noreferrer">Open Telegram invite</a> : "—"}</td><td>{invitation.EXPIRES_AT || "No expiry"}</td><td><Status value={invitation.GROUP_STATUS || "Pending"} positive={invitation.GROUP_STATUS === "JOINED"} /></td></tr>) : <tr><td colSpan="4" className="text-center text-muted py-4">No invitations were found for your employee account.</td></tr>}
            </tbody></table></div>
          )}
        </section>
      )}

      <CreateGroupModal show={showCreateGroup} onClose={() => setShowCreateGroup(false)} onSuccess={refreshData} />
      <SendDirectMessageModal show={Boolean(selectedMember)} members={selectedMember ? [selectedMember] : []} onClose={() => setSelectedMember(null)} onSave={handleSendDm} />
      <GroupBroadcastModal show={Boolean(selectedGroup)} group={selectedGroup} onClose={() => setSelectedGroup(null)} onSend={handleSendBroadcast} />
      {busy && <div className="telegram-new__busy" role="status"><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Submitting request...</div>}
    </main>
  );
};

const Metric = ({ label, value, icon, onClick }) => (
  <button type="button" className="telegram-new__metric" onClick={onClick} disabled={!onClick}><span className="telegram-new__metric-icon"><i className={`ti ${icon}`} aria-hidden="true" /></span><span className="telegram-new__metric-label">{label}</span><strong>{value}</strong></button>
);

const Status = ({ value, positive }) => <span className={`telegram-new__status ${positive ? "is-positive" : ""}`}>{value}</span>;

const GroupRows = ({ groups, loading, emptyText, onInvite, onBroadcast }) => (
  <div className="table-responsive"><table className="table align-middle telegram-new__table"><thead><tr><th>Group</th><th>Telegram group ID</th><th>Joined members</th><th>Status</th><th>Actions</th></tr></thead><tbody>
    {loading ? <tr><td colSpan="5" className="text-center py-4">Loading groups...</td></tr> : groups.length ? groups.map((group) => <tr key={group.ID}><td><strong>{group.TITLE || "Unnamed group"}</strong><small className="d-block text-muted">{group.GROUP_CODE || group.DESCRIPTION || ""}</small></td><td>{group.TELEGRAM_GROUP_ID || "—"}</td><td>{group.member_count ?? "—"}</td><td><Status value={String(group.ACTIVE_FLAG) === "1" ? "Active" : "Inactive"} positive={String(group.ACTIVE_FLAG) === "1"} /></td><td><div className="telegram-new__row-actions"><button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => onInvite(group)}>Assign members</button><button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onBroadcast(group)}>Broadcast</button></div></td></tr>) : <tr><td colSpan="5" className="text-center text-muted py-4">{emptyText}</td></tr>}
  </tbody></table></div>
);

export default TelegramNew;