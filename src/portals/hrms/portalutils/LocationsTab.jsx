import { DataTable } from "primereact/datatable";
import { useState } from "react";
import useLocationsTabHandler from "./useLocationsTabHandler";
import { getLocationsColumns, renderLocationsColumns } from "./locationsColumns";
import ReportingTab from "./ReportingTab";
import AllowancesTab from "./AllowancesTab";

const LocationsTab = ({ organogramId, onOrganogramSaved, showAll, onCancelEdit }) => {
  const [modalState, setModalState] = useState(null);
  const {
    organogramDetails,
    locations,
    loadingDetails,
    loadingLocations,
    reloadLocations,
    getGeoMappingOptionsForRow,
    savingAll,
    handleCancelEdits,
    handleBulkSave,
    updateBulkRowField,
  } = useLocationsTabHandler(organogramId, onOrganogramSaved);

  // Mode is driven entirely by the shared top toggle (Organogram.jsx) —
  // no local button or state needed anymore. showAll=true -> plain list
  // (matches KRA's list mode); showAll=false -> editable form with
  // pickers/dropdown, matching KRA's default form mode.
  const isEditing = !showAll;

  const isLoading = loadingDetails || loadingLocations;

  const columnDefs = getLocationsColumns({
    organogramDetails,
    getGeoMappingOptions: getGeoMappingOptionsForRow,
    isEditing,
    updateBulkRowField,
  });

  const columns = renderLocationsColumns(columnDefs, {
    onShowAllowance: (allowId, locId) =>
      setModalState({ type: "allowances", locId, allowId }),
    onShowReporting: (locId) =>
      setModalState({ type: "reporting", locId }),
  });

  const handleCloseModal = () => setModalState(null);

  return (
    <div>
      <DataTable
        key={isEditing ? "edit" : "view"}
        value={locations}
        loading={isLoading}
        dataKey="SNO"
        size="small"
        emptyMessage="No positions defined for this organogram."
      >
        {columns}
      </DataTable>

      {isEditing && (
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleBulkSave(false)}
            disabled={savingAll}
          >
            {savingAll ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              handleCancelEdits();
              onCancelEdit?.();
            }}
            disabled={savingAll}
          >
            Cancel
          </button>
        </div>
      )}

      {modalState && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          aria-hidden="false"
          aria-modal="true"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalState.type === "reporting"
                    ? "Reporting Manager"
                    : "Allowances & Reimbursement"}
                </h5>
          <button
            type="button"
            className="btn-close custom-btn-close p-0"
            onClick={handleCloseModal}
            aria-label="Close"
          >
            <i className="ti ti-x" />
          </button>
              </div>
              <div className="modal-body">
                {modalState.type === "reporting" ? (
                  <ReportingTab
                    organogramId={organogramId}
                    locId={modalState.locId}
                    showAll={false}
                    onCancelEdit={handleCloseModal}
                    onSaved={reloadLocations}
                  />
                ) : (
                  <AllowancesTab
                    organogramId={organogramId}
                    locId={modalState.locId}
                    allowId={modalState.allowId}
                    showAll={false}
                    onCancelEdit={handleCloseModal}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationsTab;