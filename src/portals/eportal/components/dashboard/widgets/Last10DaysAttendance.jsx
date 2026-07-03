const Last10DaysAttendance = ({ data = [] }) => {
  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-semibold">Last 10 Days Attendance</h6>
      </div>

      <div
        className="card-body p-2"
        style={{ maxHeight: 350, overflowY: "auto" }}
      >
        <table className="table table-sm mb-0">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>In</th>
              <th>Out</th>
              <th>Hrs</th>
              <th>OnDesk</th>
              <th>OffDesk</th>
              <th>Terrace</th>
              <th>Leave</th>
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((r, i) => (
                <tr key={i}>
                  <td>{r.date}</td>
                  <td>{r.in}</td>
                  <td>{r.out}</td>

                  <td className="fw-semibold">
                    {r.workingHrs || "—"}
                  </td>

                  <td>{r.onDesk}</td>
                  <td>{r.offDesk}</td>
                  <td>{r.terrace}</td>

                  <td className="text-danger">
                    {r.leaveType || "--"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Last10DaysAttendance;
