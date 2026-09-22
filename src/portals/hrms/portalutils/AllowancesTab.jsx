import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Calendar } from "primereact/calendar";
import SDLReactSelect from "../../../components/SDLReactSelect";
import { parseDDMonYY } from "../../../utils/formatUtils";
import useAllowancesTabHandler from "./useAllowancesTabHandler";
import { getAllowancesColumns, renderAllowancesColumns } from "./allowancesColumns";

const AllowancesTab = ({ organogramId, locId, showAll, onCancelEdit }) => {
  const {
    allowanceRows,
    allowanceOptions,
    loadingRows,
    loadingOptions,
    saving,
    deletingId,
    editingAllowanceId,
    selectedAllowId,
    setSelectedAllowId,
    effectiveFrom,
    setEffectiveFrom,
    startEditingAllowance,
    cancelEditingAllowance,
    saveAllowanceForm,
    removeAllowanceRow,
  } = useAllowancesTabHandler(organogramId, locId);

  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    setFormOpen(false);
    cancelEditingAllowance();
  }, [showAll, locId, cancelEditingAllowance]);

  if (!locId) {
    return <div className="text-muted py-3">No data found. Open Allowances from a Locations row.</div>;
  }

  const isEditing = !showAll || formOpen;

  const handleEdit = (row) => {
    startEditingAllowance({
      ...row,
      EFFEC_FROM: parseDDMonYY(row.EFFEC_FROM) || row.EFFEC_FROM,
    });
    setFormOpen(true);
  };

  const handleCancel = () => {
    cancelEditingAllowance();
    setFormOpen(false);
    onCancelEdit?.();
  };

  const columnDefs = getAllowancesColumns();

  const columns = renderAllowancesColumns(columnDefs, {
    onEdit: handleEdit,
    onDelete: removeAllowanceRow,
    deletingId,
  });

  return (
    <div>
      {isEditing && (
        <div className="row align-items-end mb-3">
          <div className="col-xl-5 col-lg-6 col-md-8">
            <label className="form-label">Allowance</label>
            <SDLReactSelect
              value={selectedAllowId}
              options={allowanceOptions}
              onChange={setSelectedAllowId}
              placeholder="Select Allowance"
              isLoading={loadingOptions}
              isDisabled={saving}
            />
          </div>
          <div className="col-xl-3 col-lg-4 col-md-5">
            <label className="form-label">Effective From</label>
            <Calendar
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.value)}
              dateFormat="dd-M-yy"
              showIcon
              className="w-100"
              disabled={saving}
            />
          </div>
          <div className="col-auto">
            <button
              type="button"
              className="btn btn-primary"
              onClick={saveAllowanceForm}
              disabled={!selectedAllowId || !effectiveFrom || saving}
            >
              {saving ? "Saving..." : editingAllowanceId ? "Update" : "Save"}
            </button>
            {editingAllowanceId && (
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            )}
            {!editingAllowanceId && (
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      <DataTable
        value={allowanceRows}
        loading={loadingRows || saving}
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