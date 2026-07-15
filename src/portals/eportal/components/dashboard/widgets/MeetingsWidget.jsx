const MeetingsWidget = ({ data = [] }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  return (
    <div className="card shadow-sm border-0 mb-3">
      <div className="card-header fw-semibold">
        Today's Meetings
      </div>

      <div className="card-body p-2">
        {data.map((meeting, index) => (
          <div
            key={
              meeting.id ??
              `${meeting.start_time}-${meeting.end_time}-${meeting.room_label}-${index}`
            }
            className="d-flex justify-content-between align-items-center small mb-2"
          >
            <span>
              {meeting.start_time} - {meeting.end_time}
            </span>

            <span className="fw-medium">
              {meeting.room_label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetingsWidget;