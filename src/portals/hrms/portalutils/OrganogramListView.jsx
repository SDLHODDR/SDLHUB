import SDLDataTable from "../../../components/datatable/SDLDataTable";
import { organogramColumns } from "./organogramColumns";

// Table-mode view for the Organogram tab — mirrors KRAActivity's list
// mode. Fed directly from the same `orgonogram` array that already
// powers the top dropdown, so no separate fetch is needed here.
const OrganogramListView = ({ data, loading, onEdit }) => {
  const columns = organogramColumns({ onEdit });

  return (
    <div className="table-responsive">
      <SDLDataTable
        data={data}
        columns={columns}
        loading={loading}
        emptyMessage="No organograms found"
        removableSort
        tableStyle={{ minWidth: "650px" }}
      />
    </div>
  );
};

export default OrganogramListView;