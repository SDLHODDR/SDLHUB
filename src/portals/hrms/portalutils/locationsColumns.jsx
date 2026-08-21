import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { formatDate } from "../../../utils/formatUtils";
import SDLActionButtons from "../../../components/SDLActionButtons";

const getGeoLocationDisplay = (row, organogramDetails) => {
  if (organogramDetails?.EMP_LEVEL === "15") {
    return `${row.DIVSN_DESC ?? ""} ( ${row.LOC_LABEL ?? ""} )`;
  }
  return row.GEODESC ?? "";
};

export const getLocationsColumns = ({
  organogramDetails,
  getGeoMappingOptions,
}) => [
  {
    key: "SNO",
    header: "#",
    style: { width: "5%" },
    sortable: true,
    body: (row) => row.LOC_ID ?? row.SNO,
  },
  {
    key: "GEO_LOCATION_DISPLAY",
    header: "Geo Location",
    style: { width: "10%" },
    sortable: true,
    body: (row) => getGeoLocationDisplay(row, organogramDetails),
  },
  {
    key: "FROM_DATE",
    header: "From Date",
    style: { width: "8%" },
    sortable: true,
    body: (row) => row.FROM_DATE || "",
    editor: (options) => (
      // <Calendar
      //   value={formatDate(options.value) || (options.value instanceof Date ? options.value : null)}
      //   onChange={(e) => options.editorCallback(e.value)}
      //   dateFormat="dd-M-yy"
      //   showIcon
      // />
      <Calendar
        value={formatDate(options.value) || (options.value instanceof Date ? options.value : null)}
        onChange={(e) => options.editorCallback(e.value)}
        dateFormat="dd-M-yyyy"
        showIcon
        className="sdl-locations-calendar"
      />
    ),
  },
  {
    key: "TO_DATE",
    header: "To Date",
    style: { width: "8%" },
    sortable: true,
    body: (row) => row.TO_DATE || "",
    editor: (options) => (
      // <Calendar
      //   value={options.value instanceof Date ? options.value : null}
      //   onChange={(e) => options.editorCallback(e.value)}
      //   dateFormat="dd-M-yy"
      //   showIcon
      // />
      <Calendar
        value={options.value instanceof Date ? options.value : null}
        onChange={(e) => options.editorCallback(e.value)}
        dateFormat="dd-M-yy"
        showIcon
        className="sdl-locations-calendar"
      />
    ),
  },
  {
    key: "GEO_ID",
    header: "Geo Label",
    style: { width: "8%" },
    sortable: true,
    body: (row) => row.GEO_MAPPING_LABEL || row.DIVSN_DESC || row.GEODESC || "",
    editor: (options) => (
      <Dropdown
        value={options.value}
        options={getGeoMappingOptions(options.rowData)}
        onChange={(e) => options.editorCallback(e.value)}
        placeholder="Select"
        className="w-100"
        filter
      />
    ),
  },
  {
    key: "NM",
    header: "Employee",
    style: { width: "12%" },
    sortable: true,
    body: (row) => row.NM ?? "",
  },
  {
    key: "REPORT_TO_DISPLAY",
    header: "Report To",
    style: { width: "20%" },
    sortable: true,
    body: (row) => row.REPORT_TO_DISPLAY ?? "",
  },
];

export const renderLocationsColumns = (columnDefs, { onShowAllowance, onShowReporting }) => [
  ...columnDefs.map((col) => (
    <Column
      key={col.key}
      field={col.key}
      header={col.header}
      style={col.style}
      sortable={col.sortable}
      body={col.body}
      editor={col.editor}
    />
  )),
  // The missing piece — without this, editMode="row" never triggers.
  // Gives the pencil icon per row; clicking it swaps in check/times
  // (save/cancel) icons for that row, firing onRowEditComplete /
  // onRowEditCancel.
  <Column
    key="__rowEditor"
    rowEditor
    headerStyle={{ width: "6%" }}
    bodyStyle={{ textAlign: "center" }}
  />,
  <Column
    key="__actions"
    header=""
    style={{ width: "8%" }}
    body={(row) => (
      
      <SDLActionButtons
        row={row}
        actions={[
          {
            key: "allowance",
            icon: "fas fa-landmark",
            className: "btn-outline-primary",
            label: "Allowances & Reimbursement",
            onClick: (r) => onShowAllowance?.(r.ALLOW_ID, r.LOC_ID),
          },
          {
            key: "reporting",
            icon: "fas fa-list-alt",
            className: row.HAS_REPORTING ? "btn-outline-primary" : "btn-outline-secondary",
            label: "Reporting Manager",
            onClick: (r) => onShowReporting?.(r.LOC_ID),
          },
        ]}
      />
    )}
  />,
];