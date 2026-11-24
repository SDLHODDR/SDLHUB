import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import SDLPageLoader from "../../../shared/components/SDLPageLoader";
import SDLCalendar from "../../../shared/components/calendar/SDLCalendar";
import SDLReactSelect from "../../../shared/components/form/SDLReactSelect";
import {
  DATE_PICKER_FORMAT,
  DATE_PICKER_LOCALE,
  parseDateValue,
} from "../../../shared/utils/commonUtils";
import useReportingTabHandler from "./useReportingTabHandler";
import { getReportingColumns, renderReportingColumns } from "./reportingColumns";
import { isOrganogramReadOnly } from "./organogramStatus";
import SaveButton from "../../../shared/components/buttons/SaveButton";
import CancelButton from "../../../shared/components/buttons/CancelButton";

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
      EFFEC_FROM: parseDateValue(row.EFFEC_FROM),
      EFFEC_TO: parseDateValue(row.EFFEC_TO),
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
  const columns = renderReportingColumns(columnDefs, {
    onEdit: isOrganogramReadOnly(organogramStatus) ? undefined : handleEdit,
  });

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
            <SDLCalendar
              value={newEffectiveFrom}
              onChange={setNewEffectiveFrom}
              dateFormat={DATE_PICKER_FORMAT}
              locale={DATE_PICKER_LOCALE}
              allowAllDates
              appendTo="self"
              baseZIndex={2000}
              className="w-100"
              disabled={savingRow}
            />
          </div>
          <div className="col-xl-3 col-lg-4 col-md-5">
            <label className="form-label">Effective To</label>
            <SDLCalendar
              value={newEffectiveTo}
              onChange={setNewEffectiveTo}
              dateFormat={DATE_PICKER_FORMAT}
              locale={DATE_PICKER_LOCALE}
              allowAllDates
              appendTo="self"
              baseZIndex={2000}
              className="w-100"
              disabled={savingRow}
            />
          </div>
          <div className="col-12 d-flex justify-content-end gap-2 mt-3">
            <SaveButton
              onClick={handleSave}
              disabled={!selectedParentLocId || !newEffectiveFrom}
              isSubmitting={savingRow}
              isEditing={!!isUpdating}
            />
            <CancelButton onClick={handleCancel} disabled={savingRow} />
          </div>
        </div>
      )}

      {/* The common orange loader, not the grid's own grey overlay. */}
      {(loadingRows || savingRow) && <SDLPageLoader />}
      <DataTable
        value={reportingRows}
        loading={false}
        dataKey="ID"
        size="small"
        emptyMessage={(loadingRows || savingRow) ? " " : "No data found"}
      >
        {columns}
      </DataTable>
    </div>
  );
};

export default ReportingTab;
