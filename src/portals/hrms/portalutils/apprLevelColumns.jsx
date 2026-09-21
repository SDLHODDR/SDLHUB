import { Column } from "primereact/column";

export const getApprLevelColumns = () => [
  {
    key: "APPR_LEVEL",
    header: "No",
    style: { width: "10%" },
    body: (row) => row.APPR_LEVEL,
  },
  {
    key: "NAME",
    header: "Organogram",
    style: { width: "70%" },
    body: (row) => row.NAME ?? "",
  },
  {
    key: "EFFEC_FROM",
    header: "Effec From",
    style: { width: "20%" },
    body: (row) => row.EFFEC_FROM || "",
  },
];

export const renderApprLevelColumns = (columnDefs) => [
  ...columnDefs.map((col) => (
    <Column
      key={col.key}
      field={col.key}
      header={col.header}
      style={col.style}
      body={col.body}
    />
  )),
];