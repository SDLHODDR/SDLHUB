import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Calendar } from "primereact/calendar";
import SDLReactSelect from "../../../components/SDLReactSelect";
import { parseDDMonYY } from "../../../utils/formatUtils";
import useReportingTabHandler from "./useReportingTabHandler";
import { getReportingColumns, renderReportingColumns } from "./reportingColumns";

const ReportingTab = ({ organogramId, locId, showAll, onCancelEdit }) => {
  const {
    reportingRows,
    loadingRows,
    savingRow,
    parentOptions,
    selectedParentLocId,
    setSelectedParentLocId,
    newEffectiveFrom,
    setNewEffectiveFrom,
    editingReportingId,
    startEditingReporting,
    cancelEditingReporting,
    saveReporting,
  } = useReportingTabHandler(locId, organogramId);

  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    setFormOpen(false);
    cancelEditingReporting();
  }, [showAll, locId, cancelEditingReporting]);

  if (!locId) {
    return <div className="text-muted py-3">No data found. Open Reporting from a Locations row.</div>;
  }

  const isEditing = !showAll || formOpen;

  const handleEdit = (row) => {
    startEditingReporting({
      ...row,
      EFFEC_FROM: parseDDMonYY(row.EFFEC_FROM) || row.EFFEC_FROM,
    });
    setFormOpen(true);
  };

  const handleCancel = () => {
    cancelEditingReporting();
    setFormOpen(false);
    onCancelEdit?.();
  };

  const handleSave = async () => {
    await saveReporting(selectedParentLocId, newEffectiveFrom);
  };

  const columnDefs = getReportingColumns();
  const columns = renderReportingColumns(columnDefs, { onEdit: handleEdit });

  return (
    <div>
      {isEditing && (
        <div className="row align-items-end mb-3">
          <div className="col-xl-5 col-lg-6 col-md-8">
            <label className="form-label">Reporting Manager</label>
            <SDLReactSelect
              value={selectedParentLocId}
              options={parentOptions}
              onChange={setSelectedParentLocId}
              placeholder="Select Reporting Manager"
              isLoading={loadingRows}
              isDisabled={savingRow}
            />
          </div>
          <div className="col-xl-3 col-lg-4 col-md-5">
            <label className="form-label">Effective From</label>
            <Calendar
              value={newEffectiveFrom}
              onChange={(e) => setNewEffectiveFrom(e.value)}
              dateFormat="dd-M-yy"
              showIcon
              className="w-100"
              disabled={savingRow}
            />
          </div>
          <div className="col-auto">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!selectedParentLocId || !newEffectiveFrom || savingRow}
            >
              {savingRow ? "Saving..." : editingReportingId ? "Update" : "Save"}
            </button>
            {editingReportingId && (
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={handleCancel}
                disabled={savingRow}
              >
                Cancel
              </button>
            )}
            {!editingReportingId && (
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={handleCancel}
                disabled={savingRow}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      <DataTable
        value={reportingRows}
        loading={loadingRows || savingRow}
        dataKey="ID"
        size="small"
        emptyMessage="No data found"
      >
        {columns}
      </DataTable>
    </div>
  );
};

export default ReportingTab;