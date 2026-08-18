import { DataTable } from "primereact/datatable";
import useLocationsTabHandler from "./useLocationsTabHandler";
import { getLocationsColumns, renderLocationsColumns } from "./locationsColumns";

const LocationsTab = ({ organogramId }) => {
  const {
    //organogramDetails,
    locations,
    geoLocationOptions,
    employeeOptions,
    loadingDetails,
    loadingLocations,
    //loadingLookups,
    handleRowEditComplete,
    handleDeleteRow,
  } = useLocationsTabHandler(organogramId);

  //const isLoading = loadingDetails || loadingLocations || loadingLookups;
  const isLoading = loadingDetails || loadingLocations;

  const columnDefs = getLocationsColumns({
    geoLocationOptions,
    employeeOptions,
  });
  const columns = renderLocationsColumns(columnDefs, { onDeleteRow: handleDeleteRow });

  return (
    <div>
      {/* Hidden context values — kept in state rather than DOM <input>s
          since saves go through axios, not a native form POST. */}
      {/* organogramDetails?.SFM_EMP_LEVEL / DIVSN_ID are read directly
          from state in useLocationsTabHandler when saving a row. */}

      <DataTable
        value={locations}
        loading={isLoading}
        editMode="row"
        dataKey="SNO"
        onRowEditComplete={handleRowEditComplete}
        size="small"
        emptyMessage="No positions defined for this organogram."
      >
        {columns}
      </DataTable>
    </div>
  );
};

export default LocationsTab;