import { useEffect, useState, useCallback, useRef } from "react";
import { getAttendanceLog } from "../../../services/dashboardService";

const formatDate = (date) =>
  date.toLocaleDateString("en-GB", {
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

const timeToMinutes = (timeStr = "") => {
  const match = timeStr.match(/(\d+)h\s*(\d+)m/i);

  if (match) {
    return Number(match[1]) * 60 + Number(match[2]);
  }

  const hoursMatch = timeStr.match(/(\d+)h/i);
  if (hoursMatch) {
    return Number(hoursMatch[1]) * 60;
  }

  const minsMatch = timeStr.match(/(\d+)m/i);
  if (minsMatch) {
    return Number(minsMatch[1]);
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
  const [date, setDate] = useState(new Date());

  const [records, setRecords] = useState(
    initialData?.records || []
  );

  const [summary, setSummary] = useState(
    initialData?.summary || null
  );

  const [loading, setLoading] = useState(false);

  /* ---------------------------
     LOAD ATTENDANCE
  ---------------------------- */

  const load = useCallback(async (selectedDate) => {
    setLoading(true);

    try {
      const response = await getAttendanceLog(
        formatAPIDate(selectedDate)
      );

      /*
       * If eportalRequest returns response.data:
       * response.records / response.summary
       *
       * If it returns axios response:
       * response.data.records / response.data.summary
       */

      const data = response?.data || response || {};

      setRecords(data.records || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error("Attendance load failed:", err);
      setRecords([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------------------
     INITIAL DASHBOARD DATA
  ---------------------------- */

  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && initialData) {
      setRecords(initialData.records || []);
      setSummary(initialData.summary || null);
      initialized.current = true;
      return; // Don't fetch today's data again
    }

    load(date);
  }, [date, initialData, load]);

  /* ---------------------------
     LOAD WHEN DATE CHANGES
  ---------------------------- */

  useEffect(() => {
    load(date);
  }, [date, load]);

  /* ---------------------------
     DATE NAVIGATION
  ---------------------------- */

  const changeDate = (days) => {
    setDate(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + days);
      return next;
    });
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

      const isDesk =
        item.location === "5th Floor Main" ||
        item.location === "6th Floor Main";

      if (isDesk) {
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
      {/* Header */}

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

      {/* Summary */}

      {summary && (
        <div className="mx-2 mt-2 p-2 bg-light rounded">
          <div className="fw-semibold mb-1">Summary</div>

          {summary.byLocation?.map((item, index) => (
            <div
              key={index}
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
            <span>{summary.totalOfficeTime || "00h 00m"}</span>
          </div>
        </div>
      )}

      {/* Body */}
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
            records.map((item, index) => (
              <div
                key={index}
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