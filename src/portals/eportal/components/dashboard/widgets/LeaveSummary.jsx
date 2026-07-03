import { Card } from "react-bootstrap";

const LeaveSummary = ({ data = [] }) => {
  if (!data || data.length === 0) return null;

  return (
    <Card className="dashboard-card shadow-sm border-0 h-100">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-semibold">Leave Day's Summary</h6>
      </Card.Header>

      <div className="leave-summary">
        {data.map((item, index) => {
          const total = item.consumed + item.balance;
          const consumedPercent = total
            ? Math.round((item.consumed / total) * 100)
            : 0;

          return (
            <div key={index} className="leave-item mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="fw-medium">{item.type}</span>
                <span className="text-muted small">
                  {item.consumed} / {total}
                </span>
              </div>

              <div className="progress" style={{ height: "8px" }}>
                <div
                  className="progress-bar bg-primary"
                  style={{ width: `${consumedPercent}%` }}
                />
              </div>

              <div className="d-flex justify-content-between mt-1 small text-muted">
                <span>Consumed: {item.consumed}</span>
                <span>Balance: {item.balance}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default LeaveSummary;
