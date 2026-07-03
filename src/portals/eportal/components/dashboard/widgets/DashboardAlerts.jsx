import { useState } from "react";

const DashboardAlerts = ({ alerts = [] }) => {
  const [hidden, setHidden] = useState([]);

  if (!alerts.length) return null;

  const handleClose = (index) => {
    setHidden((prev) => [...prev, index]);
  };

  return (
    <div className="dashboard-alerts">
      {alerts.map((a, i) => {
        if (hidden.includes(i)) return null;

        return (
          <div key={i} className={`alert-box ${a.type}`}>

            {/* Left Indicator */}
            <div className="alert-indicator" />

            {/* Content */}
            <div className="alert-content">
              <div className="alert-message">
                {a.message}
              </div>
            </div>

            {/* Action */}
            <div className="d-flex align-items-center gap-2">
              {a.actionUrl && (
                <a href={a.actionUrl} className="alert-action">
                  {a.actionText} →
                </a>
              )}

              {/* Close Button */}
              <button
                className="alert-close"
                onClick={() => handleClose(i)}
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}

      {/* Styles */}
      <style>{`
        .dashboard-alerts {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 10px;
        }

        .alert-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 10px;
          padding: 12px 16px;
          background: #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
          position: relative;
          transition: all 0.2s ease;
        }

        .alert-box:hover {
          transform: translateY(-1px);
        }

        .alert-indicator {
          width: 4px;
          height: 100%;
          border-radius: 4px;
          margin-right: 12px;
        }

        .alert-content {
          flex: 1;
        }

        .alert-message {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }

        .alert-action {
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          transition: 0.2s;
        }

        .alert-action:hover {
          text-decoration: underline;
        }

        .alert-close {
          background: transparent;
          border: none;
          font-size: 14px;
          cursor: pointer;
          color: #888;
        }

        .alert-close:hover {
          color: #000;
        }

        /* Danger */
        .alert-box.danger {
          background: #fff5f5;
        }

        .alert-box.danger .alert-indicator {
          background: #ff4d4f;
        }

        .alert-box.danger .alert-action {
          color: #d9363e;
        }

        /* Warning */
        .alert-box.warning {
          background: #fffbe6;
        }

        .alert-box.warning .alert-indicator {
          background: #faad14;
        }

        .alert-box.warning .alert-action {
          color: #d48806;
        }
      `}</style>
    </div>
  );
};

export default DashboardAlerts;
