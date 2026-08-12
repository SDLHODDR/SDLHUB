export const capabilitiesColumns = ({ handleEdit }) => [
  {
    header: "#",
    body: (row, meta) => meta.rowIndex + 1,
    style: { width: "70px", textAlign: "center" },
  },
  {
    header: "Skill",
    body: (row) => row.CAPA_CODE_DISPLAY,
    style: { width: "220px" },
  },
  {
    header: "Description",
    body: (row) => row.CAPA_DESC_DISPLAY,
  },
  {
    header: "Action",
    body: (row) => (
      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => handleEdit(row)}
          aria-label="Edit Capability"
        >
          <i className="ti ti-edit" />
        </button>
      </div>
    ),
    style: { width: "100px", textAlign: "center" },
  },
];