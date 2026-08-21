import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { formatDate } from "../../../utils/formatUtils";

export const getApprLevelColumns = ({ apprOptions }) => [
  {
    key: "APPR_LEVEL",
    header: "No",
    style: { width: "10%" },
    body: (row) => row.APPR_LEVEL,
  },
  {
    key: "NAME",
    header: "Organogram",
    style: { width: "40%" },
    body: (row) => row.NAME ?? "",
    editor: (options) => (
      <Dropdown
        value={options.value}
        options={apprOptions}
        onChange={(e) => options.editorCallback(e.value)}
        placeholder="Select Appraiser"
        className="w-100"
        filter
      />
    ),
  },
  {
    key: "EFFEC_FROM",
    header: "Effec From",
    style: { width: "20%" },
    body: (row) => row.EFFEC_FROM || "",
    editor: (options) => (
      <Calendar
        value={formatDate(options.value) || (options.value instanceof Date ? options.value : null)}
        onChange={(e) => options.editorCallback(e.value)}
        dateFormat="dd-M-yyyy"
        showIcon
        className="sdl-locations-calendar"   // was sdl-apprlevel-calendar
      />
    ),
  },
  {
    key: "EFFEC_TO",
    header: "Effec To",
    style: { width: "20%" },
    body: (row) => row.EFFEC_TO || "",
    editor: (options) => (
      <Calendar
        value={formatDate(options.value) || (options.value instanceof Date ? options.value : null)}
        onChange={(e) => options.editorCallback(e.value)}
        dateFormat="dd-M-yyyy"
        showIcon
        className="sdl-locations-calendar"
      />
    ),
  },
];

export const renderApprLevelColumns = (columnDefs) => [
  // Drag handle — first, so it's always visible regardless of edit state
  <Column key="__reorder" rowReorder style={{ width: "5%" }} />,
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