import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { parseOracleDate } from "./dateUtils";

const getGeoLocationDisplay = (row, organogramDetails) => {
  if (organogramDetails?.EMP_LEVEL === "15") {
    return `${row.DIVSN_DESC ?? ""} ( ${row.LOC_LABEL ?? ""} )`;
  }
  return row.GEODESC ?? "";
};

export const getLocationsColumns = ({
  organogramDetails,
  getGeoMappingOptions, // (row) => options[] — still pending real API, see below
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
      <Calendar
        value={parseOracleDate(options.value) || (options.value instanceof Date ? options.value : null)}
        onChange={(e) => {
          options.editorCallback(e.value);
          options.rowData.__onFromDateChange?.(e.value);
        }}
        dateFormat="dd-M-yy"
        showIcon
      />
    ),
  },
  {
    key: "TO_DATE",
    header: "To Date",
    style: { width: "8%" },
    sortable: true,
    // Always starts blank per the confirmed UI — saved EFFEC_TO is
    // intentionally NOT shown as a default value here.
    body: (row) => row.TO_DATE || "",
    editor: (options) => (
      <Calendar
        value={options.value instanceof Date ? options.value : null}
        onChange={(e) => options.editorCallback(e.value)}
        dateFormat="dd-M-yy"
        showIcon
      />
    ),
  },
  {
    key: "GEO_ID",
    header: "Geo Label",
    style: { width: "8%" },
    sortable: true,
    // display value — will show the resolved label once the
    // geo-mapping lookup is wired up
    body: (row) => row.GEO_MAPPING_LABEL || row.DIVSN_DESC || "",
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

export const renderLocationsColumns = (columnDefs, { onShowAllowance, onShowReportTo }) => [
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
  <Column
    key="__actions"
    header=""
    style={{ width: "5%" }}
    body={(row) => (
      <>
        <button
          type="button"
          className="btn btn-sm btn-danger me-1"
          title="Allowances & Reimbursement"
          onClick={() => onShowAllowance?.(row.ALLOW_ID, row.LOC_ID)}
        >
          <i className="fas fa-landmark" />
        </button>
        <button
          type="button"
          className={`btn btn-sm ${row.HAS_REPORTING ? "btn-info" : "btn-secondary"}`}
          title="Reporting Manager"
          onClick={() => onShowReportTo?.(row.LOC_ID)}
        >
          <i className="fas fa-list-alt" />
        </button>
      </>
    )}
  />,
];