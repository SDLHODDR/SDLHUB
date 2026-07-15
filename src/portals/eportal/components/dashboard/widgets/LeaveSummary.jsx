import { Card } from "react-bootstrap";

const LeaveSummary = ({ data = [] }) => {
  if (!data?.length) return null;

  return (
    <Card className="dashboard-card shadow-sm border-0 h-100">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-semibold">
          Leave Summary
        </h6>
      </Card.Header>

      <div className="leave-summary">
        {data.map((item) => {
          const consumed = Number(item.consumed || 0);
          const balance = Number(item.balance || 0);

          const total = consumed + balance;

          const consumedPercent =
            total > 0
              ? Math.round((consumed / total) * 100)
              : 0;

          return (
            <div
              key={item.type}
              className="leave-item mb-3"
            >
              <div className="d-flex justify-content-between mb-1">
                <span className="fw-medium">
                  {item.type}
                </span>

                <span className="text-muted small">
                  {consumed} / {total}
                </span>
              </div>

              <div
                className="progress"
                style={{ height: "8px" }}
              >
                <div
                  className="progress-bar bg-primary"
                  style={{
                    width: `${Math.min(
                      consumedPercent,
                      100
                    )}%`,
                  }}
                />
              </div>

              <div className="d-flex justify-content-between mt-1 small text-muted">
                <span>
                  Consumed: {consumed}
                </span>

                <span>
                  Balance: {balance}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default LeaveSummary;