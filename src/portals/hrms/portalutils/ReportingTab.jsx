import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Calendar } from "primereact/calendar";
import SDLReactSelect from "../../../components/SDLReactSelect";
import { parseDDMonYY } from "../../../utils/formatUtils";
import useReportingTabHandler from "./useReportingTabHandler";
import { getReportingColumns, renderReportingColumns } from "./reportingColumns";
import { isOrganogramReadOnly } from "./organogramStatus";

const ReportingTab = ({ organogramId, organogramStatus, locId, repId, showAll, onCancelEdit, onSaved }) => {
  const {
    reportingRows,
    loadingRows,
    savingRow,
    parentOptions,
    selectedParentLocId,
    setSelectedParentLocId,
    newEffectiveFrom,
    setNewEffectiveFrom,
    newEffectiveTo,
    setNewEffectiveTo,
    editingReportingId,
    startEditingReporting,
    cancelEditingReporting,
    saveReporting,
  } = useReportingTabHandler(locId, organogramId, repId);

  const [formOpen, setFormOpen] = useState(false);

  const toCalendarDate = (value) => {
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }
    if (!value) return null;

    const rawValue = String(value).trim();
    const fullDdMonDate = rawValue.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})(?:\s|$)/);
    if (fullDdMonDate) {
      const fullDate = new Date(
        Number(fullDdMonDate[3]),
        new Date(`${fullDdMonDate[2]} 1, 2000`).getMonth(),
        Number(fullDdMonDate[1])
      );
      return Number.isNaN(fullDate.getTime()) ? null : fullDate;
    }

    const ddMonDate = parseDDMonYY(rawValue.slice(0, 9));
    if (ddMonDate) return ddMonDate;

    const isoDate = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoDate) {
      const date = new Date(
        Number(isoDate[1]),
        Number(isoDate[2]) - 1,
        Number(isoDate[3])
      );
      return Number.isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(rawValue);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  useEffect(() => {
    setFormOpen(false);
    cancelEditingReporting();
  }, [showAll, locId, cancelEditingReporting]);

  if (!locId) {
    return <div className="text-muted py-3">No data found. Open Reporting from a Locations row.</div>;
  }

  const isEditing = (!showAll || formOpen) && !isOrganogramReadOnly(organogramStatus);
  const isUpdating = Boolean(editingReportingId || repId);

  const handleEdit = (row) => {
    startEditingReporting({
      ...row,
      EFFEC_FROM: toCalendarDate(row.EFFEC_FROM),
      EFFEC_TO: toCalendarDate(row.EFFEC_TO),
    });
    setFormOpen(true);
  };

  const handleCancel = () => {
    cancelEditingReporting();
    setFormOpen(false);
    onCancelEdit?.();
  };

  const handleSave = async () => {
    const saved = await saveReporting(selectedParentLocId, newEffectiveFrom, newEffectiveTo);
    if (saved) {
      onCancelEdit?.();
      await onSaved?.();
    }
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
              appendTo="self"
              baseZIndex={2000}
              className="w-100"
              disabled={savingRow}
            />
          </div>
          <div className="col-xl-3 col-lg-4 col-md-5">
            <label className="form-label">Effective To</label>
            <Calendar
              value={newEffectiveTo}
              onChange={(e) => setNewEffectiveTo(e.value)}
              dateFormat="dd-M-yy"
              showIcon
              appendTo="self"
              baseZIndex={2000}
              className="w-100"
              disabled={savingRow}
            />
          </div>
          <div className="col-12 mt-3">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!selectedParentLocId || !newEffectiveFrom || savingRow}
            >
              {savingRow ? "Saving..." : isUpdating ? "Update" : "Save"}
            </button>
            {isUpdating && (
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={handleCancel}
                disabled={savingRow}
              >
                Cancel
              </button>
            )}
            {!isUpdating && (
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