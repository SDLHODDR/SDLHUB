import { useState } from "react";
import { DataTable } from "primereact/datatable";
import useReportingTabHandler from "./useReportingTabHandler";
import { getReportingColumns, renderReportingColumns } from "./reportingColumns";

const ReportingTab = ({ organogramId, locId }) => {
  const {
    reportingRows,
    loadingRows,
    savingRow,
    handleRowEditInit,
    handleRowEditComplete,
    handleRowEditCancel,
    getParentOptionsForRow,
  } = useReportingTabHandler(locId);

  const [editingRows, setEditingRows] = useState({});

  const columnDefs = getReportingColumns({ getParentOptionsForRow });
  const columns = renderReportingColumns(columnDefs);

  return (
    <DataTable
      value={reportingRows}
      loading={loadingRows || savingRow}
      editMode="row"
      dataKey="ID"
      editingRows={editingRows}
      onRowEditChange={(e) => setEditingRows(e.data)}
      onRowEditInit={handleRowEditInit}
      onRowEditComplete={handleRowEditComplete}
      onRowEditCancel={handleRowEditCancel}
      size="small"
      emptyMessage="No data found"
    >
      {columns}
    </DataTable>
  );
};

export default ReportingTab;