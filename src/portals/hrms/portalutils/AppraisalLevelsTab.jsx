import { useState } from "react";
import { DataTable } from "primereact/datatable";
import useApprLevelTabHandler from "./useApprLevelTabHandler";
import { getApprLevelColumns, renderApprLevelColumns } from "./apprLevelColumns";

const AppraisalLevelsTab = ({ organogramId }) => {
  const {
    apprLevels,
    apprOptions,
    loadingApprLevels,
    savingRow,
    reordering,
    handleRowEditComplete,
    handleRowEditCancel,
    handleRowReorder,
  } = useApprLevelTabHandler(organogramId);

  const [editingRows, setEditingRows] = useState({});

  const isLoading = loadingApprLevels || savingRow || reordering;

  const columnDefs = getApprLevelColumns({ apprOptions });
  const columns = renderApprLevelColumns(columnDefs);

  return (
    <DataTable
      value={apprLevels}
      loading={isLoading}
      editMode="row"
      dataKey="APPR_ORGID"
      editingRows={editingRows}
      onRowEditChange={(e) => setEditingRows(e.data)}
      onRowEditComplete={handleRowEditComplete}
      onRowEditCancel={handleRowEditCancel}
      reorderableRows
      onRowReorder={handleRowReorder}
      size="small"
      emptyMessage="No appraisal levels defined for this organogram."
    >
      {columns}
    </DataTable>
  );
};

export default AppraisalLevelsTab;