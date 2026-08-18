export const policyColumns = ({ handleEdit }) => [
  {
    field: "COMP_DESC",
    header: "Company Name",
    style: { width: "18%" },
  },
  {
    field: "DEPT_DESC",
    header: "Department Name",
    style: { width: "14%" },
  },
  {
    field: "DIVSN_DESC",
    header: "Division Name",
    style: { width: "14%" },
  },
  {
    field: "POLICY_NAME",
    header: "Policy Name",
    style: { width: "14%" },
  },
  {
    field: "START_DATE_DISPLAY",
    header: "Start Date",
    style: { width: "8%", textAlign: "center" },
  },
  {
    field: "END_DATE_DISPLAY",
    header: "End Date",
    style: { width: "8%", textAlign: "center" },
  },
  {
    field: "POLICY_DESC",
    header: "Policy Description",
    style: { width: "18%" },
  },
  {
    header: "Upload Document",
    body: (row) =>
      row.DOC_PATH ? (
        <a href={row.DOC_PATH} target="_blank" rel="noopener noreferrer" aria-label="Download policy document">
          <i className="fas fa-download icon-xl" />
        </a>
      ) : (
        "-"
      ),
    style: { width: "6%", textAlign: "center" },
  },
  {
    header: "Status",
    body: (row) =>
      row.STATUS === "A" ? (
        <span className="text-muted">Published</span>
      ) : (
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => handleEdit(row)}
          aria-label="Edit Policy"
        >
          <i className="fa fa-pencil" />
        </button>
      ),
    style: { width: "6%", textAlign: "center" },
  },
];