import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import SDLPageLoader from "../../../shared/components/SDLPageLoader";
import SDLCalendar from "../../../shared/components/calendar/SDLCalendar";
import SDLReactMultiSelect from "../../../shared/components/form/SDLReactMultiSelect";
import useAllowancesTabHandler from "./useAllowancesTabHandler";
import { getAllowancesColumns, renderAllowancesColumns } from "./allowancesColumns";
import { isOrganogramReadOnly } from "./organogramStatus";
import { DATE_PICKER_FORMAT, DATE_PICKER_LOCALE } from "../../../shared/utils/commonUtils";
import SaveButton from "../../../shared/components/buttons/SaveButton";
import CancelButton from "../../../shared/components/buttons/CancelButton";

const AllowancesTab = ({ organogramId, organogramStatus, locId, showAll, onCancelEdit }) => {
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

  const isEditing = (!showAll || formOpen) && !isOrganogramReadOnly(organogramStatus);

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
            <SDLCalendar
              value={effectiveFrom}
              onChange={setEffectiveFrom}
              dateFormat={DATE_PICKER_FORMAT}
              locale={DATE_PICKER_LOCALE}
              allowAllDates
              appendTo="self"
              baseZIndex={2000}
              className="w-100"
              disabled={saving}
            />
          </div>
          <div className="col-12 d-flex justify-content-end gap-2 mt-3">
            <SaveButton
              onClick={saveAllowanceForm}
              disabled={!selectedAllowIds.length || !effectiveFrom}
              isSubmitting={saving}
              isEditing={!!editingAllowanceId}
            />
            <CancelButton onClick={handleCancel} disabled={saving} />
          </div>
        </div>
      )}

      {/* The common orange loader, not the grid's own grey overlay. */}
      {(loadingRows || saving) && <SDLPageLoader />}
      <DataTable
        value={allowanceRows}
        loading={false}
        dataKey="ID"
        size="small"
        emptyMessage={(loadingRows || saving) ? " " : "No data found"}
      >
        {columns}
      </DataTable>
    </div>
  );
};

export default AllowancesTab;
