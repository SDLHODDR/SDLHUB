import { useEffect, useMemo, useState } from "react";

import BreadcrumbNav from "../breadcrumb-nav/BreadcrumbNav";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";
import SDLSearch from "../../../../components/datatable/SDLSearch";

import { getErrorLogs } from "../../services/logService";
import { notifyError } from "../../../../services/alertService";
import "../../assets/css/viewLog.css";

const ViewLog = () => {
  /* ==========================================
        TODAY
    ========================================== */

  const today = new Date().toISOString().split("T")[0];

  /* ==========================================
        STATE
    ========================================== */

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedDate, setSelectedDate] = useState(today);

  const [logDate, setLogDate] = useState("");

  const [selectedLog, setSelectedLog] = useState(null);

  /* ==========================================
        INITIAL LOAD
    ========================================== */

  useEffect(() => {
    loadLogs(today);
  }, []);

  /* ==========================================
        LOAD LOGS
    ========================================== */

  const loadLogs = async (date = selectedDate) => {
    setLoading(true);

    try {
      const response = await getErrorLogs(date);

      if (response.status) {
        setLogs(response.logs || []);

        setLogDate(response.logDate || date);
      } else {
        notifyError(response.message || "Unable to fetch logs.");

        setLogs([]);
      }
    } catch (error) {
      notifyError(error.message);

      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================
        SEARCH
    ========================================== */

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) {
      return logs;
    }

    const keyword = searchQuery.toLowerCase();

    return logs.filter(
      (log) =>
        (log.time || "").toLowerCase().includes(keyword) ||
        (log.user || "").toLowerCase().includes(keyword) ||
        (log.errorCode || "").toLowerCase().includes(keyword) ||
        (log.message || "").toLowerCase().includes(keyword),
    );
  }, [logs, searchQuery]);

  /* ==========================================
        BADGE COLOR
    ========================================== */

  const getBadgeClass = (code = "") => {
    switch (code) {
      case "ORA-12899":
        return "bg-danger";

      case "ORA-01400":
        return "bg-warning text-dark";

      case "ORA-00001":
        return "bg-info";

      case "ORA-00942":
        return "bg-primary";

      case "ORA-06502":
        return "bg-dark";

      default:
        return "bg-secondary";
    }
  };

  /* ==========================================
        FORMAT MESSAGE
    ========================================== */

  const formatMessage = (message = "") => {
    return message
      .replace(/^ORA-\d+:\s*/i, "")
      .replace("(actual:", "\n\nActual :")
      .replace("maximum:", "Maximum :")
      .replace(")", "");
  };

  /* ==========================================
        ERROR BADGE
    ========================================== */

  const errorBadge = (rowData) => (
    <span className={`badge rounded-pill ${getBadgeClass(rowData.errorCode)}`}>
      {rowData.errorCode || "-"}
    </span>
  );

  /* ==========================================
        MESSAGE COLUMN
    ========================================== */

  const messageBody = (rowData) => {
    const msg = rowData.message || "";

    return (
      <span title={msg}>
        {msg.length > 80 ? msg.substring(0, 80) + "..." : msg}
      </span>
    );
  };

  /* ==========================================
        VIEW DETAILS BUTTON
    ========================================== */

  const actionBody = (rowData) => (
    <button
      className="btn btn-primary btn-sm"
      title="View Details"
      onClick={() => setSelectedLog(rowData)}
      data-bs-toggle="modal"
      data-bs-target="#logModal"
    >
      <i className="ti ti-eye"></i>
    </button>
  );

  /* ==========================================
        TABLE COLUMNS
    ========================================== */

  const columns = [
    {
      field: "time",
      header: "Time",
      sortable: true,
      style: {
        width: "120px",
      },
    },

    {
      field: "user",
      header: "Login User",
      sortable: true,
      style: {
        width: "140px",
      },
    },

    {
      header: "Error Code",
      body: errorBadge,
      sortable: true,
      style: {
        width: "130px",
      },
    },

    {
      header: "Error Message",
      body: messageBody,
    },

    {
      header: "Action",
      body: actionBody,
      style: {
        width: "90px",
        textAlign: "center",
      },
    },
  ];

  return (
    <>
      {/* ================= PAGE HEADER ================= */}

      <div className="page-header">
        <div className="page-title">
          <h4>Application Error Logs</h4>

          <h6>View application errors generated by the ePortal system</h6>
        </div>

        <BreadcrumbNav
          items={[
            {
              text: "Home",
              link: "/eportal/dashboard",
            },
            {
              text: "Application Logs",
            },
          ]}
        />
      </div>

      {/* ================= CARD ================= */}

      <div className="card">
        <div className="card-body">
          {/* ================= FILTERS ================= */}

          <div className="row align-items-end mb-3">
            <div className="col-lg-3 col-md-4">
              <label className="form-label fw-semibold">Log Date</label>

              <input
                type="date"
                className="form-control"
                value={selectedDate}
                max={today}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="col-lg-3 col-md-4">
              <button
                className="btn btn-primary me-2"
                onClick={() => loadLogs(selectedDate)}
              >
                <i className="ti ti-search me-1"></i>
                Load Logs
              </button>

              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSelectedDate(today);

                  loadLogs(today);
                }}
              >
                Today
              </button>
            </div>

            <div className="col-lg-3 col-md-4">
              <SDLSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search Logs..."
              />
            </div>

            <div className="col-lg-3 text-end">
              <button
                className="btn btn-outline-primary"
                onClick={() => loadLogs(selectedDate)}
              >
                <i className="ti ti-refresh me-1"></i>
                Refresh
              </button>
            </div>
          </div>

          {/* ================= SUMMARY ================= */}

          <div className="row mb-3">
            <div className="col-md-6">
              <div>
                Showing Logs For :
                <strong className="ms-2">{logDate || "-"}</strong>
                  &nbsp;&nbsp;&nbsp;Total Errors : {filteredLogs.length}
              </div>
            </div>
          </div>
          {/* ================= TABLE ================= */}

          <SDLDataTable
            data={filteredLogs}
            columns={columns}
            loading={loading}
            removableSort
            emptyMessage="No log records found."
          />
        </div>
      </div>

      {/* ================= MODAL ================= */}

      <div
        className="modal fade"
        id="logModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Error Details</h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              {selectedLog && (
                <>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="fw-semibold">Error Time</label>

                      <div className="detail-box">{selectedLog.time}</div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="fw-semibold">Login User</label>

                      <div className="detail-box">{selectedLog.user}</div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="fw-semibold">Error Code</label>

                      <div className="detail-box">
                        <span
                          className={`badge rounded-pill ${getBadgeClass(
                            selectedLog.errorCode,
                          )}`}
                        >
                          {selectedLog.errorCode}
                        </span>
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="fw-semibold">Log Date</label>

                      <div className="detail-box">{logDate}</div>
                    </div>

                    <div className="col-md-12 mb-3">
                      <label className="fw-semibold">Oracle Backtrace</label>

                      <div className="detail-box">
                        {selectedLog.line || "-"}
                      </div>
                    </div>

                    {selectedLog.file && (
                        <div className="col-md-12 mb-3">
                            <label className="fw-semibold">Source File</label>

                            <div className="detail-box">
                                {selectedLog.file}
                            </div>
                        </div>
                    )}

                    {selectedLog.sql && (
                        <div className="col-md-12 mb-3">
                            <label className="fw-semibold">SQL Query</label>

                            <div className="alert alert-light border">
                                <pre
                                    className="mb-0"
                                    style={{
                                        whiteSpace: "pre-wrap",
                                        fontFamily: "Consolas, monospace",
                                        fontSize: "13px",
                                    }}
                                >
                                    {selectedLog.sql}
                                </pre>
                            </div>
                        </div>
                    )}

                    <div className="col-md-12">
                      <label className="fw-semibold">Error Message</label>

                      <div className="alert alert-danger">
                        <pre
                          className="mb-0"
                          style={{
                            whiteSpace: "pre-wrap",
                            fontFamily: "inherit",
                          }}
                        >
                          {formatMessage(selectedLog.message)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewLog;
