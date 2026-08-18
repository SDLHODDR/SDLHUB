import SDLActionButtons from "../../../components/SDLActionButtons";
import { getKraActivityActions } from "./kraActivityActions";

const serialBody = (rowData, options) =>
  options.rowIndex + 1 + (options.props.first || 0);

const titleBody = (row) => <>{row.ACTT_DESC}</>;

export const kraActivityColumns = ({
  handleEditActivity,
  handleDeleteActivity,
  deletingId,
}) => [
  {
    header: "#",
    body: serialBody,
    style: { width: "70px", textAlign: "center" },
  },
  {
    field: "KRA_DESC",
    header: "KRA Master",
    sortable: true,
    style: { width: "260px" },
  },
  {
    field: "ACTT_DESC",
    header: "KRA Activity",
    body: titleBody,
    sortable: true,
    style: { width: "220px" },
  },
  {
    header: "Action",
    body: (row) => (
      // <div className="d-flex align-items-center justify-content-center gap-2">
      //   <button
      //     type="button"
      //     className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
      //     onClick={() => handleEditActivity(row)}
      //     aria-label="Edit KRA Activity"
      //   >
      //     <i className="ti ti-edit" />
      //   </button>
      //   <button
      //     type="button"
      //     className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
      //     aria-label="Delete KRA Activity"
      //     onClick={() => handleDeleteActivity(row)}
      //     disabled={deletingId === row.ID}
      //   >
      //     {deletingId === row.ID ? (
      //       <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
      //     ) : (
      //       <i className="ti ti-trash" />
      //     )}
      //   </button>
      // </div>
      <SDLActionButtons
        row={row}
        actions={getKraActivityActions({
          handleEditActivity,
          handleDeleteActivity,
          deletingId,
        })}
      />
    ),
    style: { width: "140px", textAlign: "center" },
  },
];