const serialBody = (rowData, options) =>
  options.rowIndex + 1 + (options.props.first || 0);

export const departmentActivityColumns = ({ handleDeleteActivity, deletingId }) => [
  {
    header: "#",
    body: serialBody,
    style: { width: "70px", textAlign: "center" },
  },
  {
    field: "DEPT_DESC",
    header: "Department",
    sortable: true,
    style: { width: "220px" },
  },
  {
    field: "ACT_TYPE",
    header: "Type",
    sortable: true,
    style: { width: "120px" },
  },
  {
    field: "DISP_SEQ",
    header: "Sequence",
    sortable: true,
    style: { width: "110px", textAlign: "center" },
  },
  {
    field: "ACT_DESC",
    header: "Department Activity",
    sortable: true,
    style: { minWidth: "220px" },
  },
  {
    header: "Action",
    body: (row) => (
      <div className="d-flex align-items-center justify-content-center gap-2">
        <button
          type="button"
          className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
          aria-label="Delete Department Activity"
          onClick={() => handleDeleteActivity(row)}
          disabled={deletingId === row.ID}
        >
          {deletingId === row.ID ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
          ) : (
            <i className="ti ti-trash" />
          )}
        </button>
      </div>
    ),
    style: { width: "140px", textAlign: "center" },
  },
];