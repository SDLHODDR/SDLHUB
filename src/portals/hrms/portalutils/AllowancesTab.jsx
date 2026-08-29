import { DataTable } from "primereact/datatable";
import useAllowancesTabHandler from "./useAllowancesTabHandler";
import { getAllowancesColumns, renderAllowancesColumns } from "./allowancesColumns";

const AllowancesTab = ({ organogramId, locId }) => {
  const {
    allowanceRows,
    allowanceOptions,
    loadingRows,
    loadingOptions,
    saving,
    deletingId,
    isAdding,
    selectedAllowIds,
    setSelectedAllowIds,
    newEffecFrom,
    setNewEffecFrom,
    startAddAllowance,
    cancelAddAllowance,
    saveNewAllowanceRow,
    removeAllowanceRow,
  } = useAllowancesTabHandler(organogramId, locId);

  const tableValue = isAdding
    ? [...allowanceRows, { __isNew: true, ID: "__NEW__" }]
    : allowanceRows;

  const columnDefs = getAllowancesColumns({
    allowanceOptions,
    loadingOptions,
    selectedAllowIds,
    setSelectedAllowIds,
    newEffecFrom,
    setNewEffecFrom,
  });

  const columns = renderAllowancesColumns(columnDefs, {
    onSave: saveNewAllowanceRow,
    onCancel: cancelAddAllowance,
    onDelete: removeAllowanceRow,
    saving,
    deletingId,
  });

  return (
    <div>
      <div className="d-flex justify-content-end mb-2">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={startAddAllowance}
          disabled={isAdding || !locId}
        >
          <i className="fas fa-plus me-1" /> Add Allowance
        </button>
      </div>

      <DataTable
        value={tableValue}
        loading={loadingRows}
        dataKey="ID"
        size="small"
        emptyMessage="No data found"
      >
        {columns}
      </DataTable>
    </div>
  );
};

export default AllowancesTab;