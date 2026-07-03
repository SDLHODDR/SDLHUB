import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "./sdlDataTable.css";

const SDLDataTable = ({
    data = [],
    columns = [],
    loading = false,
    emptyMessage = "No records found",
    rows = 10,
    paginator = data.length > rows,
    rowsPerPageOptions = [10, 25, 50, 100],
    className = "",
    tableStyle = { minWidth: "900px" },
    ...rest
}) => {
    return (
        <DataTable
            value={data}
            loading={loading}
            paginator={paginator}
            rows={rows}
            rowsPerPageOptions={rowsPerPageOptions}
            stripedRows
            showGridlines
            responsiveLayout="scroll"
            scrollable
            paginatorDropdownAppendTo="self"
            tableStyle={tableStyle}
            emptyMessage={emptyMessage}
            className={`p-datatable-sm ${className}`}
            {...rest}
        >
            {columns.map((col, index) => (
                <Column
                    key={col.field || index}
                    {...col}
                />
            ))}
        </DataTable>
    );
};

export default SDLDataTable;