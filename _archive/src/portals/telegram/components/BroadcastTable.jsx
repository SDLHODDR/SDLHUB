import { getMockGroups } from "../services/mockData";

const BroadcastTable = ({ broadcasts }) => {
  const groups = getMockGroups();

  const getGroupNames = (groupIds = []) => {
    return groups.filter((g) =>
      groupIds.includes(g.id)
    );
  };

  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr>
            <th>Title</th>
            <th>Groups</th>
            <th>Status</th>
            <th>Sent On</th>
          </tr>
        </thead>

        <tbody>
          {broadcasts.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="fw-semibold">
                  {item.title}
                </div>

                <small className="text-muted">
                  {item.message}
                </small>
              </td>

              <td>
                <div className="d-flex flex-wrap gap-1">
                  {getGroupNames(item.groupIds).map(
                    (group) => (
                      <span
                        key={group.id}
                        className="badge bg-light text-dark border"
                      >
                        {group.group_name}
                      </span>
                    )
                  )}
                </div>
              </td>

              <td>
                <span className="badge bg-success">
                  {item.status}
                </span>
              </td>

              <td>{item.sent_on}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BroadcastTable;