import { Column } from "primereact/column";
//import { Dropdown } from "primereact/dropdown";

export const getReportingColumns = () => [
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
  },
  {
    key: "EFFEC_FROM",
    header: "Effec From",
    style: { width: "17%" },
    body: (row) => row.EFFEC_FROM || "",
  },
  {
    key: "EFFEC_TO",
    header: "Effec To",
    style: { width: "18%" },
    body: (row) => row.EFFEC_TO || "",
  },
];

export const renderReportingColumns = (columnDefs, { onEdit } = {}) => [
  ...columnDefs.map((col) => (
    <Column
      key={col.key}
      field={col.key}
      header={col.header}
      style={col.style}
      body={col.body}
    />
  )),
  <Column
    key="__actions"
    header=""
    style={{ width: "8%" }}
    body={(row) => (
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        onClick={() => onEdit?.(row)}
        title="Edit reporting"
        aria-label="Edit reporting"
      >
        <i className="fas fa-edit" />
      </button>
    )}
  />,
];