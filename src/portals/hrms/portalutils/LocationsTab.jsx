import { DataTable } from "primereact/datatable";
import useLocationsTabHandler from "./useLocationsTabHandler";
import { getLocationsColumns, renderLocationsColumns } from "./locationsColumns";

const LocationsTab = ({ organogramId, onNavigateToTab, onOrganogramSaved, showAll, onCancelEdit }) => {
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
      onNavigateToTab?.("allowances", { LOC_ID: locId, ALLOW_ID: allowId }),
    onShowReporting: (locId) =>
      onNavigateToTab?.("reporting", { LOC_ID: locId }),
  });

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
    </div>
  );
};

export default LocationsTab;