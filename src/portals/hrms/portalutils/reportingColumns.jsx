import { Column } from "primereact/column";
//import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { parseDDMonYY } from "../../../utils/formatUtils";
import SDLReactSelect from "../../../components/SDLReactSelect";

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
      <SDLReactSelect
        value={opts.value}
        options={getParentOptionsForRow(opts.rowData)}
        onChange={(value) => opts.editorCallback(value)}
        placeholder=" Parent Location"
      />
    ),
  },
  {
    key: "EFFEC_FROM",
    header: "Effec From",
    style: { width: "17%" },
    body: (row) => row.EFFEC_FROM || "",
    editor: (opts) => {
       const calendarValue = opts.value instanceof Date ? opts.value : parseDDMonYY(opts.value);
        return (
          <Calendar
            value={calendarValue}
            onChange={(e) => opts.editorCallback(e.value)}
            dateFormat="dd-M-yy"
            showIcon
            className="sdl-locations-calendar"
          />
        );
      },
  },
  {
    key: "EFFEC_TO",
    header: "Effec To",
    style: { width: "18%" },
    body: (row) => row.EFFEC_TO || "",
    editor: (opts) => {
       const calendarValue = opts.value instanceof Date ? opts.value : parseDDMonYY(opts.value);
        return (
          <Calendar
            value={calendarValue}
            onChange={(e) => opts.editorCallback(e.value)}
            dateFormat="dd-M-yy"
            showIcon
            className="sdl-locations-calendar"
          />
        );
      },
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