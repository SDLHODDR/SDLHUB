import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Calendar } from "primereact/calendar";
import SDLReactMultiSelect from "../../../components/SDLReactMultiSelect";
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
    selectedAllowIds,
    setSelectedAllowIds,
    effectiveFrom,
    setEffectiveFrom,
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

  const handleCancel = () => {
    cancelEditingAllowance();
    setFormOpen(false);
    onCancelEdit?.();
  };

  const columnDefs = getAllowancesColumns();

  const columns = renderAllowancesColumns(columnDefs, {
    onDelete: removeAllowanceRow,
    deletingId,
  });

  return (
    <div>
      {isEditing && (
        <div className="row align-items-end mb-3">
          <div className="col-xl-5 col-lg-6 col-md-8">
            <label className="form-label">Allowance</label>
            <SDLReactMultiSelect
              value={selectedAllowIds}
              options={allowanceOptions}
              onChange={setSelectedAllowIds}
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
              appendTo="self"
              baseZIndex={2000}
              className="w-100"
              disabled={saving}
            />
          </div>
          <div className="col-auto">
            <button
              type="button"
              className="btn btn-primary"
              onClick={saveAllowanceForm}
              disabled={!selectedAllowIds.length || !effectiveFrom || saving}
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