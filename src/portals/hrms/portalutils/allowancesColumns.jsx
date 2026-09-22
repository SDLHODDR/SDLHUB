import { Column } from "primereact/column";

export const getAllowancesColumns = () => [
  {
    key: "NO",
    header: "No",
    style: { width: "5%" },
    body: (row, options) => (row.__isNew ? "" : options.rowIndex + 1),
  },
  {
    key: "ALLOWANCE",
    header: "Allowance",
    style: { width: "50%" },
    body: (row) => row.ALLOW_DESC ?? "",
  },
  {
    key: "FROM_DATE",
    header: "From Date",
    style: { width: "20%" },
    body: (row) => row.EFFEC_FROM || "",
  },
  {
    key: "TO_DATE",
    header: "To Date",
    style: { width: "20%" },
    body: (row) => row.EFFEC_TO || "",
  },
];

export const renderAllowancesColumns = (columnDefs, { onEdit, onDelete, deletingId }) => [
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
    style={{ width: "5%" }}
    body={(row) => (
      <div className="d-flex gap-2 justify-content-center">
        <button type="button" className="btn btn-sm btn-outline-primary" title="Edit allowance" onClick={() => onEdit?.(row)}>
          <i className="fas fa-edit" />
        </button>
        {String(row.EFFEC_TO || "").trim() === "" && (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            title="Delete allowance"
            onClick={deletingId === row.ID ? undefined : () => onDelete(row)}
            disabled={deletingId === row.ID}
          >
            <i className="fas fa-trash" />
          </button>
        )}
      </div>
    )}
  />,
];