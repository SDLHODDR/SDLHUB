const Last10DaysAttendance = ({ data = [] }) => {
  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-header">
        <h6 className="mb-0 fw-semibold">
          Last 10 Days Attendance
        </h6>
      </div>

      <div
        className="card-body p-2"
        style={{ maxHeight: 350, overflowY: "auto" }}
      >
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Date</th>
              <th>In</th>
              <th>Out</th>
              <th>Hours</th>
              <th>On Desk</th>
              <th>Off Desk</th>
              <th>Terrace</th>
              <th>Leave</th>
            </tr>
          </thead>

          <tbody>
            {Array.isArray(data) && data.length > 0 ? (
              data.map((row, index) => (
                <tr key={index}>
                  <td>{row.date ?? "--"}</td>
                  <td>{row.in ?? "--"}</td>
                  <td>{row.out ?? "--"}</td>
                  <td>{row.workingHrs ?? "--"}</td>
                  <td>{row.onDesk ?? "--"}</td>
                  <td>{row.offDesk ?? "--"}</td>
                  <td>{row.terrace ?? "--"}</td>
                  <td>{row.leaveType ?? "--"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center">
                  No attendance data available
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