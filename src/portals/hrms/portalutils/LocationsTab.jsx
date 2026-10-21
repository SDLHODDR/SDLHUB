import { DataTable } from "primereact/datatable";
import { createPortal } from "react-dom";
import { useState } from "react";
import useLocationsTabHandler from "./useLocationsTabHandler";
import { getLocationsColumns, renderLocationsColumns } from "./locationsColumns";
import ReportingTab from "./ReportingTab";
import AllowancesTab from "./AllowancesTab";
import { isOrganogramReadOnly } from "./organogramStatus";
import SaveButton from '../components/buttons/SaveButton'
import CancelButton from '../components/buttons/CancelButton'

const LocationsDataTable = ({
  organogramId,
  isEditing,
  tableVersion,
  locations,
  loading,
  columns,
  loadPageData,
}) => {
  const [page, setPage] = useState({ first: 0, rows: 10 });

  return (
    <DataTable
      key={`${organogramId}-${isEditing}-${tableVersion}`}
      value={locations}
      loading={loading}
      dataKey='SNO'
      size='small'
      paginator={locations.length > page.rows}
      first={page.first}
      rows={page.rows}
      rowsPerPageOptions={[10, 25, 50]}
      onPage={(event) => {
        setPage({ first: event.first, rows: event.rows });
        loadPageData(
          locations.slice(event.first, event.first + event.rows),
          isEditing
        );
      }}
      emptyMessage='No positions defined for this organogram.'
    >
      {columns}
    </DataTable>
  );
};

const LocationsTab = ({ organogramId, organogramStatus, onOrganogramSaved, showAll, onCancelEdit }) => {
  const [modalState, setModalState] = useState(null);
  const [tableVersion, setTableVersion] = useState(0);
  const {
    organogramDetails,
    locations,
    loadingDetails,
    loadingLocations,
    reloadLocations,
    loadPageData,
    getGeoMappingOptionsForRow,
    savingAll,
    handleCancelEdits,
    handleBulkSave,
    updateBulkRowField
  } = useLocationsTabHandler(organogramId, onOrganogramSaved)

  // Mode is driven entirely by the shared top toggle (Organogram.jsx) —
  // no local button or state needed anymore. showAll=true -> plain list
  // (matches KRA's list mode); showAll=false -> editable form with
  // pickers/dropdown, matching KRA's default form mode.
  const isEditing = !showAll && !isOrganogramReadOnly(organogramStatus);

  const isLoading = loadingDetails || loadingLocations

  const columnDefs = getLocationsColumns({
    organogramDetails,
    getGeoMappingOptions: getGeoMappingOptionsForRow,
    isEditing,
    updateBulkRowField
  })

  const columns = renderLocationsColumns(columnDefs, {
    onShowAllowance: (allowId, locId) =>
      setModalState({ type: "allowances", locId, allowId }),
    onShowReporting: (locId) =>
      setModalState({ type: "reporting", locId }),
  });

  const handleCloseModal = () => setModalState(null);
  const handleReloadLocations = async () => {
    setTableVersion((version) => version + 1);
    await reloadLocations();
  };

  return (
    <div>
      <LocationsDataTable
        organogramId={organogramId}
        isEditing={isEditing}
        tableVersion={tableVersion}
        locations={locations}
        loading={isLoading}
        columns={columns}
        loadPageData={loadPageData}
      />

      {isEditing && (
        <div className='d-flex justify-content-end gap-2 mt-3'>
          <SaveButton
            onClick={() => handleBulkSave(false)}
            disabled={savingAll}
            isSubmitting={savingAll}
          />

          <CancelButton
            onClick={() => {
              handleCancelEdits()
              onCancelEdit?.()
            }}
            disabled={savingAll}
          />
        </div>
      )}

      {modalState && createPortal(
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          aria-hidden="false"
          aria-modal="true"
          role="dialog"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            position: "fixed",
            inset: 0,
            zIndex: 1055,
          }}
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
                    organogramStatus={organogramStatus}
                    locId={modalState.locId}
                    showAll={false}
                    onCancelEdit={handleCloseModal}
                    onSaved={handleReloadLocations}
                  />
                ) : (
                  <AllowancesTab
                    organogramId={organogramId}
                    organogramStatus={organogramStatus}
                    locId={modalState.locId}
                    allowId={modalState.allowId}
                    showAll={false}
                    onCancelEdit={handleCloseModal}
                  />
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default LocationsTab
