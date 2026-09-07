import { useEffect, useState, useCallback } from "react";
import { getAttendanceLog } from "../services/dashboardService";

const formatAPIDate = (date) =>
  date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-");

const AttendanceLogForOD = ({ empCode = null, gpassDate = null }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!empCode || !gpassDate) {
      setRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await getAttendanceLog(
        formatAPIDate(new Date(gpassDate)),
        empCode
      );

      const data = response?.data || response || {};
      setRecords(data.records || []);
    } catch (err) {
      console.error("Attendance load failed:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [empCode, gpassDate]);

  useEffect(() => {
    load();
  }, [load]);

  // Pair consecutive IN/OUT records into columns
  const pairs = [];
  for (let i = 0; i < records.length; i += 2) {
    pairs.push({
      in: records[i],
      out: records[i + 1] || null,
    });
  }

  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body p-2">
        {loading ? (
          <div className="text-center py-4 text-muted">Loading...</div>
        ) : pairs.length === 0 ? (
          <div className="text-center text-muted py-4">
            No Activity Available
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              columnGap: "16px",
              rowGap: "10px",
            }}
          >
            {pairs.map((pair, index) => (
              <div key={index} style={{ whiteSpace: "nowrap" }}>
                <div className="small">IN: {pair.in?.time || "-"}</div>
                <div className="small">OUT: {pair.out?.time || "-"}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceLogForOD;