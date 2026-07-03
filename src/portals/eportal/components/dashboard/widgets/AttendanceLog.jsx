import { useEffect, useState, useCallback } from "react";
import { getAttendanceLog } from "../../../services/dashboardService";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatAPIDate = (date) =>
  date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-");

/* =========================
   TIME HELPERS
========================= */

const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;

  const match = timeStr.match(/(\d+)h\s*(\d+)m/i);

  if (match) {
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  }

  const hoursMatch = timeStr.match(/(\d+)h/i);
  if (hoursMatch) {
    return parseInt(hoursMatch[1], 10) * 60;
  }

  const minsMatch = timeStr.match(/(\d+)m/i);
  if (minsMatch) {
    return parseInt(minsMatch[1], 10);
  }

  return 0;
};

const minutesToTime = (minutes) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hrs).padStart(2, "0")}h ${String(mins).padStart(
    2,
    "0"
  )}m`;
};

const AttendanceLog = ({ initialData = null }) => {
  const [date, setDate] = useState(new Date("02-APR-2025"));
  const [records, setRecords] = useState(initialData?.records || []);
  const [summary, setSummary] = useState(initialData?.summary || null);
  const [loading, setLoading] = useState(false);

  /* ---------------------------
     LOAD FUNCTION
  ---------------------------- */
  const load = useCallback(async (d) => {
    try {
      setLoading(true);

      const formatted = formatAPIDate(d);
      const res = await getAttendanceLog(formatted);

      setRecords(res?.records || []);
      setSummary(res?.summary || null);
    } catch (e) {
      console.error("Attendance load failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------------------
     INITIAL LOAD
  ---------------------------- */
  useEffect(() => {
    if (!initialData) {
      load(date);
    }
  }, [initialData, date, load]);

  /* ---------------------------
     DATE NAVIGATION
  ---------------------------- */
  const changeDate = (days) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);

    setDate(newDate);
    load(newDate);
  };

  /* ---------------------------
     DESK SUMMARY
  ---------------------------- */
  const deskSummary = (() => {
    if (!summary?.byLocation?.length) {
      return {
        onDesk: "00h 00m",
        offDesk: "00h 00m",
      };
    }

    let onDeskMinutes = 0;
    let offDeskMinutes = 0;

    summary.byLocation.forEach((item) => {
      const mins = timeToMinutes(item.formatted);

      const isDeskLocation =
        item.location === "5th Floor Main" ||
        item.location === "6th Floor Main";

      if (isDeskLocation) {
        onDeskMinutes += mins;
      } else {
        offDeskMinutes += mins;
      }
    });

    return {
      onDesk: minutesToTime(onDeskMinutes),
      offDesk: minutesToTime(offDeskMinutes),
    };
  })();

  return (
    <div className="card shadow-sm border-0 h-100">
      {/* HEADER */}
      <div className="card-header d-flex justify-content-between align-items-center">
        <button
          className="btn btn-sm btn-light"
          onClick={() => changeDate(-1)}
        >
          ◀
        </button>

        <h6 className="mb-0 fw-semibold">
          Log Dated {formatDate(date)}
        </h6>

        <button
          className="btn btn-sm btn-light"
          onClick={() => changeDate(1)}
        >
          ▶
        </button>
      </div>

      {/* SUMMARY */}
      {summary && (
        <div className="mx-2 mt-2 p-2 bg-light rounded">
          <div className="fw-semibold mb-1">
            Summary
          </div>

          {summary.byLocation?.map((item, i) => (
            <div
              key={i}
              className="d-flex justify-content-between small"
            >
              <span>{item.location}</span>
              <span>{item.formatted}</span>
            </div>
          ))}

          <hr className="my-2" />

          <div className="d-flex justify-content-between small fw-semibold text-success">
            <span>On Desk</span>
            <span>{deskSummary.onDesk}</span>
          </div>

          <div className="d-flex justify-content-between small fw-semibold text-warning">
            <span>Off Desk</span>
            <span>{deskSummary.offDesk}</span>
          </div>

          <hr className="my-2" />

          <div className="d-flex justify-content-between fw-semibold">
            <span>Total</span>
            <span>{summary.totalOfficeTime}</span>
          </div>
        </div>
      )}

      {/* BODY */}
      <div className="card-body p-2">
        <div style={{ maxHeight: 250, overflowY: "auto" }}>
          {loading ? (
            <div className="text-center py-4 text-muted">
              Loading...
            </div>
          ) : records.length === 0 ? (
            <div className="text-center text-muted py-4">
              No Activity Available
            </div>
          ) : (
            records.map((item, i) => (
              <div
                key={i}
                className="d-flex align-items-start mb-2 p-2 rounded"
                style={{
                  background: "#f8f9fa",
                  borderLeft: `4px solid ${
                    item.type === "IN"
                      ? "#28a745"
                      : "#dc3545"
                  }`,
                }}
              >
                <div className="me-2">
                  <span
                    className={`badge ${
                      item.type === "IN"
                        ? "bg-success"
                        : "bg-danger"
                    }`}
                  >
                    {item.type}
                  </span>
                </div>

                <div>
                  <div className="fw-semibold">
                    {item.location}
                  </div>

                  <small className="text-muted">
                    {item.time}
                  </small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceLog;