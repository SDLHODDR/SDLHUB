import { useEffect, useState } from "react";
import { getGroups } from "../services/telegramService";

const MemberFilters = ({
  search,
  setSearch,
  selectedGroup,
  setSelectedGroup,
}) => {
    const [groups, setGroups] = useState([]);

    useEffect(() => {
      let isMounted = true;

      getGroups()
        .then((response) => {
          if (isMounted) {
            setGroups(Array.isArray(response?.data) ? response.data : []);
          }
        })
        .catch(() => {
          if (isMounted) setGroups([]);
        });

      return () => {
        isMounted = false;
      };
    }, []);
    
  return (
    <div className="row g-3 mb-3">
      <div className="col-md-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="col-md-3">
        <select
          className="form-select"
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="">All Groups</option>

          {groups.map((group) => (
            <option key={group.ID} value={group.TITLE}>
              {group.TITLE}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MemberFilters;