import { DataTable } from "primereact/datatable";
import { useState } from "react";
import Modal from "react-bootstrap/Modal";
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

      <Modal show={!!modalState} onHide={handleCloseModal} size="xl" centered>
        <Modal.Header>
          <Modal.Title>
            {modalState?.type === "reporting" ? "Reporting Manager" : "Allowances & Reimbursement"}
          </Modal.Title>
          <button
            type="button"
            className="btn-close custom-btn-close p-0"
            onClick={handleCloseModal}
            aria-label="Close"
          >
            <i className="ti ti-x" />
          </button>
        </Modal.Header>
        <Modal.Body>
          {modalState?.type === "reporting" ? (
            <ReportingTab
              organogramId={organogramId}
              locId={modalState.locId}
              showAll={false}
              onCancelEdit={handleCloseModal}
            />
          ) : (
            <AllowancesTab
              organogramId={organogramId}
              locId={modalState?.locId}
              allowId={modalState?.allowId}
              showAll={false}
              onCancelEdit={handleCloseModal}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LocationsTab;