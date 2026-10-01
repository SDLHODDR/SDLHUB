import { useEffect, useMemo, useState } from "react";
import "../styles/telegram.css";
import GroupCard from "../components/GroupCard";
import GroupTable from "../components/GroupTable";
import GroupFilters from "../components/GroupFilters";
import { getGroups } from "../services/telegramService";

const SDLTelegramGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  // const [showCreateModal, setShowCreateModal] = useState(false);

  const loadGroups = async () => {
    try {
      const res = await getGroups();
      setGroups(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      setError(
          error?.message ||
          "Unable to load Telegram groups.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    getGroups()
      .then((response) => {
        if (!isMounted) return;
        setGroups(Array.isArray(response?.data) ? response.data : []);
        setError("");
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              "Unable to load Telegram groups.",
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

  // ======================================
	// FILTER GROUPS
	// ======================================
  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const matchSearch = (group.TITLE || "")
        .toLowerCase()
        .includes(search.toLowerCase());

      const groupStatus = String(group.ACTIVE_FLAG) === "1" ? "Active" : "Inactive";
      const matchStatus = !status || groupStatus === status;
      return matchSearch && matchStatus;
    });
  }, [groups, search, status]);

  const paginatedGroups =
    filteredGroups.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );

  const hasGroups = (groups.length) > 0;
  return (
    <div className="container-fluid py-4 telegram-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Telegram PSR Groups</h2>
          <p className="text-muted mb-0"> Manage Telegram groups, members and broadcasts. </p>
        </div>
      </div>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="telegram-stat-card card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">Total Groups</h6>
              <h3 className="fw-bold mb-0">{groups.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="telegram-stat-card card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">Total Members</h6>
              <h3 className="fw-bold mb-0"> {groups.reduce((total, item) => total + Number(item.member_count || 0), 0)} </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="telegram-stat-card card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">Active Groups</h6>
              <h3 className="fw-bold mb-0"> { groups.filter( (item) => item.ACTIVE_FLAG === "1" ).length } </h3>
            </div>
          </div>
        </div>
        {/* <div className="col-md-3">
          <div className="telegram-stat-card card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="text-muted">Maximum Groups</h6>
              <h3 className="fw-bold mb-0">N/A</h3>
            </div>
          </div>
        </div> */}
      </div>
      <GroupFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        onCreateSuccess={loadGroups}
        isFilter={hasGroups}
      />
      {loading ? (
        <div className="text-center py-5"> <div className="spinner-border text-primary" /> </div>
      ) : (
      <>
        <div className="row g-3 mb-4">
          {filteredGroups.map((group) => (
            <div className="col-md-6 col-xl-4" key={group.ID}>
                <GroupCard group={group} />
            </div>
          ))}
        </div>

        {/* <GroupTable groups={filteredGroups} /> */}
        <GroupTable
          groups={paginatedGroups}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          total={filteredGroups.length}
          isFilter={hasGroups}
        />
      </>
      )}
    </div>
  );
};

export default SDLTelegramGroups;