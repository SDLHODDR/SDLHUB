import { Column } from "primereact/column";
//import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { formatDate } from "../../../utils/formatUtils";
import SDLActionButtons from "../../../components/SDLActionButtons";
import SDLReactSelect from "../../../components/SDLReactSelect";

const getGeoLocationDisplay = (row, organogramDetails) => {
  if (organogramDetails?.EMP_LEVEL === "15") {
    if (!row.DIVSN_DESC && !row.LOC_LABEL) return "No Data";
    return `${row.DIVSN_DESC ?? "-" } ( ${row.LOC_LABEL ?? "-"} )`;
    //return `${row.DIVSN_DESC ?? ""} ( ${row.LOC_LABEL ?? ""} )`;
  }
  return row.GEODESC || "No Data";
};

const MONTH_MAP = { JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11 };

const parseDDMonYY = (str) => {
  if (!str || typeof str !== "string") return null;
  const match = str.match(/^(\d{2})-([A-Za-z]{3})-(\d{2})$/);
  if (!match) return null;
  const [, dd, mon, yy] = match;
  const month = MONTH_MAP[mon.toUpperCase()];
  if (month === undefined) return null;
  const date = new Date(2000 + Number(yy), month, Number(dd));
  return isNaN(date.getTime()) ? null : date;
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
  // {
  //   key: "FROM_DATE",
  //   header: "From Date",
  //   style: { width: "8%" },
  //   sortable: true,
  //   body: (row) => row.FROM_DATE || "No Data",
  //   editor: (options) => (
      
  //     <Calendar
  //       value={formatDate(options.value) || (options.value instanceof Date ? options.value : null)}
  //       onChange={(e) => options.editorCallback(e.value)}
  //       dateFormat="dd-M-yyyy"
  //       showIcon
  //       className="sdl-locations-calendar"
  //     />
  //   ),
  // },
  {
    key: "FROM_DATE",
    header: "From Date",
    style: { width: "8%" },
    sortable: true,
    body: (row) => row.FROM_DATE || "No Data",
    editor: (options) => {
      const calendarValue =
        options.value instanceof Date ? options.value : parseDDMonYY(options.value);
      return (
        <Calendar
          value={calendarValue}
          onChange={(e) => options.editorCallback(e.value)}
          dateFormat="dd-M-yy"
          showIcon
          className="sdl-locations-calendar"
        />
      );
    },
  },
 {
    key: "TO_DATE",
    header: "To Date",
    style: { width: "8%" },
    sortable: true,
    body: (row) => row.TO_DATE || "No Data",
    editor: (options) => {
      const calendarValue =
        options.value instanceof Date ? options.value : parseDDMonYY(options.value);
      return (
        <Calendar
          value={calendarValue}
          onChange={(e) => options.editorCallback(e.value)}
          dateFormat="dd-M-yy"
          showIcon
          className="sdl-locations-calendar"
        />
      );
    },
  },
  {
    key: "GEO_ID",
    header: "Geo Label",
    style: { width: "16%", minWidth: "180px" },
    sortable: true,
    body: (row) => row.GEO_MAPPING_LABEL || row.DIVSN_DESC || row.GEODESC || "No Data",
    editor: (options) => (
      <div style={{ minWidth: "160px" }}>
        <SDLReactSelect
          value={options.value}
          options={getGeoMappingOptions(options.rowData)}
          onChange={(value) => options.editorCallback(value)}
          placeholder="Select"
        />
      </div>
    ),
  },
  {
    key: "NM",
    header: "Employee",
    style: { width: "10%" },
    sortable: true,
    body: (row) => row.NM || "No Data",
  },
  {
    key: "REPORT_TO_DISPLAY",
    header: "Report To",
    style: { width: "14%" },
    sortable: true,
    body: (row) => row.REPORT_TO_DISPLAY || "No Data",
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