import { useState } from "react";
import { DataTable } from "primereact/datatable";
import useLocationsTabHandler from "./useLocationsTabHandler";
import { getLocationsColumns, renderLocationsColumns } from "./locationsColumns";

const LocationsTab = ({ organogramId, onNavigateToTab, onOrganogramSaved }) => {
  const {
    organogramDetails,
    locations,
    loadingDetails,
    loadingLocations,
    handleRowEditComplete,
    handleRowEditCancel,
    getGeoMappingOptionsForRow,
    validateLocationRow,
    clearRowFieldError,
  } = useLocationsTabHandler(organogramId, onOrganogramSaved);

  const [editingRows, setEditingRows] = useState({});

  const isLoading = loadingDetails || loadingLocations;

  const columnDefs = getLocationsColumns({
    organogramDetails,
    getGeoMappingOptions: getGeoMappingOptionsForRow,
    clearRowFieldError,
  });

  const columns = renderLocationsColumns(columnDefs, {
    onShowAllowance: (allowId, locId) =>
      onNavigateToTab?.("allowances", { LOC_ID: locId, ALLOW_ID: allowId }),
    onShowReporting: (locId) =>
      onNavigateToTab?.("reporting", { LOC_ID: locId }),
  });

  return (
    <DataTable
      value={locations}
      loading={isLoading}
      editMode="row"
      dataKey="SNO"
      editingRows={editingRows}
      onRowEditChange={(e) => setEditingRows(e.data)}
      rowEditValidator={validateLocationRow}
      onRowEditComplete={handleRowEditComplete}
      onRowEditCancel={handleRowEditCancel}
      size="small"
      emptyMessage="No positions defined for this organogram."
    >
      {columns}
    </DataTable>
  );
};

export default LocationsTab;
