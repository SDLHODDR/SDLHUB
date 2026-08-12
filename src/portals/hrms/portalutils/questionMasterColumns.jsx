import { buildOptionsFromRow } from "./questionOptionsUtils";

const serialBody = (rowData, options) => options.rowIndex + 1;

export const questionMasterColumns = ({ handleEdit, handleDelete, deletingId }) => [
  {
    header: "#",
    body: serialBody,
    style: { width: "70px", textAlign: "center" },
  },
  {
    header: "Group",
    body: (r) => r.QSGRP_DESC || r.GROUP_NAME || "",
    style: { width: "200px" },
  },
  {
    header: "Question",
    body: (r) => r.QUES_DESCR || r.QUESTION || "",
    style: { minWidth: "300px" },
  },
  {
    header: "Type",
    body: (r) => r.RATING || r.rating || r.answer_type || r.ANSWER_TYPE || "",
    style: { width: "120px" },
  },
  {
    header: "Options",
    body: (r) => buildOptionsFromRow(r).filter(Boolean).join(", "),
  },
  {
    header: "Action",
    body: (r) => (
      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => handleEdit(r)}
          aria-label="Edit Question"
        >
          <i className="ti ti-edit" />
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => handleDelete(r)}
          disabled={deletingId === r.ID}
          aria-label="Delete Question"
        >
          {deletingId === r.ID ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
          ) : (
            <i className="ti ti-trash" />
          )}
        </button>
      </div>
    ),
  },
];