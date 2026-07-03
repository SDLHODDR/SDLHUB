const MeetingsWidget = ({ data = [] }) => {
  if (!data.length) return null;

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header fw-semibold">
        Today's Meetings
      </div>

      <div className="card-body p-2">
        {data.map((m, i) => (
          <div
            key={i}
            className="d-flex justify-content-between small mb-2"
          >
            <span>
              {m.start_time} - {m.end_time}
            </span>
            <span className="fw-medium">
              {m.room_label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetingsWidget;
