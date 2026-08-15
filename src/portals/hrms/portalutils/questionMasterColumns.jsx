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
    body: (r) => r.GROUP_NAME || r.QSGRP_DESC || "",
    style: { width: "200px" },
  },
  {
    header: "Sub Group",
    // Fixed: listData now outputs SUBGROUP_NAME (renamed from a QSGRP_DESC
    // key that was colliding with the Group field's own name). QSSGRP_DESC
    // / SUBGROUP_DESC are kept as fallbacks in case this column is ever
    // reused against raw, un-normalized API rows.
    body: (r) => r.SUBGROUP_NAME || r.QSSGRP_DESC || r.SUBGROUP_DESC || "",
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
