import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "./sdlDataTable.css";
import SDLPageLoader from "../SDLPageLoader";

const SDLDataTable = ({
    data = [],
    columns = [],
    loading = false,
    emptyMessage = "No records found",
    rows = 10,
    paginator = data.length > rows,
    rowsPerPageOptions = [10, 25, 50, 100],
    // Same paging bar on every portal: "Showing 1 to 10 of N entries" + page links + rows per page.
    paginatorTemplate = "CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown",
    currentPageReportTemplate = "Showing {first} to {last} of {totalRecords} entries",
    className = "",
    tableStyle = { minWidth: "900px" },
    onRowClick,
    rowHover = !!onRowClick,
    ...rest
}) => {
     return (
        <>
        {/* The common orange loader, centred on the page (not the grid's own grey spinner). */}
        {loading && <SDLPageLoader />}
        <DataTable
            value={Array.isArray(data) ? data : []}
            loading={false}
            paginator={paginator}
            rows={rows}
            rowsPerPageOptions={rowsPerPageOptions}
            paginatorTemplate={paginatorTemplate}
            currentPageReportTemplate={currentPageReportTemplate}
            stripedRows
            showGridlines
            responsiveLayout="scroll"
            scrollable
            paginatorDropdownAppendTo="self"
            tableStyle={tableStyle}
            emptyMessage={loading ? " " : emptyMessage}
            className={`p-datatable-sm ${onRowClick ? "sdl-clickable-rows" : ""} ${className}`}
            onRowClick={onRowClick}
            rowHover={rowHover}
            {...rest}
        >
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
        </>
    );
    // return (
    //     <DataTable
    //         value={Array.isArray(data) ? data : []}
    //         loading={loading}
    //         paginator={paginator}
    //         rows={rows}
    //         rowsPerPageOptions={rowsPerPageOptions}
    //         stripedRows
    //         showGridlines
    //         responsiveLayout="scroll"
    //         scrollable
    //         paginatorDropdownAppendTo="self"
    //         tableStyle={tableStyle}
    //         emptyMessage={emptyMessage}
    //         className={`p-datatable-sm ${className}`}
    //         {...rest}
    //     >
    //         {/* {columns.map((col, index) => {
    //             // Never let a stray `key` property inside col leak into the spread —
    //             // it silently overrides the explicit key below and causes
    //             // "two children with same key" / spread-key warnings.
    //             const { key: _ignoredKey, ...colProps } = col;
    //             const columnKey = col.field ?? _ignoredKey ?? index;

    //             return <Column key={columnKey} {...colProps} />;
    //         })} */}
    //         {columns.map((col, index) => {
    //             const { key: _ignoredKey, ...colProps } = col;
    //             const columnKey = col.field ?? _ignoredKey ?? `col-${index}`;

    //             return (
    //                 <Column
    //                     key={columnKey}
    //                     columnKey={columnKey}
    //                     {...colProps}
    //                 />
    //             );
    //         })}

    //     </DataTable>
    // );
};

export default SDLDataTable;