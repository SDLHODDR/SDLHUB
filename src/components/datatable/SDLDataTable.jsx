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
            value={Array.isArray(data) ? data : []}
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
            {/* {columns.map((col, index) => {
                // Never let a stray `key` property inside col leak into the spread —
                // it silently overrides the explicit key below and causes
                // "two children with same key" / spread-key warnings.
                const { key: _ignoredKey, ...colProps } = col;
                const columnKey = col.field ?? _ignoredKey ?? index;

                return <Column key={columnKey} {...colProps} />;
            })} */}
            {columns.map((col, index) => {
                const { key: _ignoredKey, ...colProps } = col;
                const columnKey = col.field ?? _ignoredKey ?? `col-${index}`;

                return (
                    <Column
                        key={columnKey}
                        columnKey={columnKey}
                        {...colProps}
                    />
                );
            })}

        </DataTable>
    );
};

export default SDLDataTable;