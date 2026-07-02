import { IMAGES } from "../../../assets/assets";

const UpcomingBirthdays = ({ data }) => {
  const todayDate = new Date();
  const todayDay = todayDate.getDate();
  const todayMonth = todayDate.toLocaleString("en-GB", { month: "short" });

  if (!data || Object.keys(data).length === 0) return null;

  return (
    <div className="card border-0 shadow-sm birthday-widget">
      {/* Header */}
      <div className="card-header bg-white border-0 d-flex align-items-center gap-2">
        <span className="emoji">🎉</span>
        <h6 className="mb-0 fw-semibold">Upcoming Birthdays</h6>
      </div>

      {/* Body */}
      <div className="card-body pt-2">
        {Object.entries(data).map(([date, employees]) => {
          const [d, m] = date.split("-");
          const isToday =
            parseInt(d, 10) === todayDay && m === todayMonth;

          return (
            <div key={date} className="mb-4">
              {/* Date Divider */}
              <div className="date-divider">
                <span>{formatDate(date)}</span>
              </div>

              {/* Employees Grid */}
              <div className="emp-grid">
                {employees.map((emp) => (
                  <div
                    key={emp.emp_code}
                    className={`emp-card ${isToday ? "today" : ""}`}
                  >
                    {isToday && (
                      <div className="today-badge">Today</div>
                    )}

                    <div className="avatar-ring">
                      <img
                        src={
                          emp.profile_image || IMAGES.DEFAULTAVTAR
                        }
                        alt={emp.name}
                        onError={(e) =>
                        (e.target.src =
                          IMAGES.DEFAULTAVTAR)
                        }
                      />
                    </div>

                    <div
                      className="emp-name"
                      title={emp.name}
                    >
                      {emp.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Styles */}
      <style>{`
        .birthday-widget {
          border-radius: 16px;
          background: linear-gradient(180deg, #ffffff, #f5f7ff);
          overflow: hidden;
        }

        /* HEADER */
        .birthday-widget .card-header {
          background: transparent;
          padding: 12px 16px;
        }

        .emoji {
          font-size: 20px;
          animation: pop 1.5s infinite ease-in-out;
        }

        @keyframes pop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }

        /* SCROLL */
        .birthday-widget .card-body {
          max-height: 260px;
          overflow-y: auto;
          padding-right: 4px;
        }

        /* DATE DIVIDER */
        .date-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 16px 0 10px;
          position: relative;
        }

        .date-divider::before {
          content: "";
          position: absolute;
          width: 100%;
          height: 1px;
          background: linear-gradient(to right, transparent, #ddd, transparent);
          top: 50%;
        }

        .date-divider span {
          background: #fff;
          padding: 4px 14px;
          font-size: 12.5px;
          font-weight: 600;
          color: #6c757d;
          border-radius: 20px;
          border: 1px solid #eee;
          z-index: 1;
        }

        /* GRID */
        .emp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 12px;
        }

        /* CARD */
        .emp-card {
          text-align: center;
          padding: 10px 6px;
          border-radius: 14px;
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(0,0,0,0.04);
          transition: all 0.25s ease;
          position: relative;
        }

        .emp-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 18px rgba(0,0,0,0.08);
          background: #eef2ff;
        }

        /* AVATAR */
        .avatar-ring {
          width: 68px;
          height: 68px;
          margin: 0 auto 6px;
          border-radius: 50%;
          padding: 3px;
          background: linear-gradient(135deg, #6f42c1, #0d6efd);
          position: relative;
        }

        .avatar-ring::after {
          content: "";
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(13,110,253,0.2), transparent);
          z-index: -1;
        }

        .avatar-ring img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #fff;
        }

        /* NAME */
        .emp-name {
          font-size: 13px;
          font-weight: 500;
          color: #2c2c2c;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* TODAY HIGHLIGHT */
        .emp-card.today {
          background: linear-gradient(135deg, #fff3cd, #ffe69c);
          border: 1px solid #ffda6a;
        }

        .today-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #ff9800;
          color: #fff;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

/* Date Formatter */
const formatDate = (dateStr) => {
  const [day, month] = dateStr.split("-");
  const d = parseInt(day, 10);

  const suffix =
    d % 10 === 1 && d !== 11
      ? "st"
      : d % 10 === 2 && d !== 12
        ? "nd"
        : d % 10 === 3 && d !== 13
          ? "rd"
          : "th";

  return `${d}${suffix} ${month}`;
};

export default UpcomingBirthdays;
