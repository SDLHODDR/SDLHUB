import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { formatDate } from "../../../utils/formatUtils";

export const getReportingColumns = ({ getParentOptionsForRow }) => [
  {
    key: "NO",
    header: "No",
    style: { width: "8%" },
    body: (row, options) => options.rowIndex + 1,
  },
  {
    key: "REPORT_TO",
    header: "Report To",
    style: { width: "22%" },
    body: (row) => row.EMP_NAME ?? "",
  },
  {
    key: "ORGNM",
    header: "Parent Organogram Location",
    style: { width: "35%" },
    body: (row) => row.ORGNM ?? "",
    editor: (opts) => (
      <Dropdown
        value={opts.value}
        options={getParentOptionsForRow(opts.rowData)}
        onChange={(e) => opts.editorCallback(e.value)}
        placeholder="Select Parent Location"
        className="w-100"
        filter
      />
    ),
  },
  {
    key: "EFFEC_FROM",
    header: "Effec From",
    style: { width: "17%" },
    body: (row) => row.EFFEC_FROM || "",
    editor: (opts) => (
      <Calendar
        value={formatDate(opts.value) || (opts.value instanceof Date ? opts.value : null)}
        onChange={(e) => opts.editorCallback(e.value)}
        dateFormat="dd-M-yyyy"
        showIcon
        className="sdl-locations-calendar"
      />
    ),
  },
  {
    key: "EFFEC_TO",
    header: "Effec To",
    style: { width: "18%" },
    body: (row) => row.EFFEC_TO || "",
    editor: (opts) => (
      <Calendar
        value={opts.value instanceof Date ? opts.value : null}
        onChange={(e) => opts.editorCallback(e.value)}
        dateFormat="dd-M-yyyy"
        showIcon
        className="sdl-locations-calendar"
      />
    ),
  },
];

export const renderReportingColumns = (columnDefs) => [
  ...columnDefs.map((col) => (
    <Column
      key={col.key}
      field={col.key}
      header={col.header}
      style={col.style}
      body={col.body}
      editor={col.editor}
    />
  )),
  <Column
    key="__rowEditor"
    rowEditor
    headerStyle={{ width: "8%" }}
    bodyStyle={{ textAlign: "center" }}
  />,
];