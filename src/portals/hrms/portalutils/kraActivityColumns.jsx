// import SDLActionButtons from "../../../components/SDLActionButtons";
// import { getKraActivityActions } from "./kraActivityActions";
import EditButton from "../components/buttons/EditButton";
import DeleteButton from "../components/buttons/DeleteButton";

// const serialBody = (rowData, options) =>
//   options.rowIndex + 1 + (options.props.first || 0);

const serialBody = (rowData, options) => (
  <div className="d-flex justify-content-center">
    {options.rowIndex + 1 + (options.props.first || 0)}
  </div>
);

const titleBody = (row) => <>{row.ACTT_DESC}</>;

export const kraActivityColumns = ({
  handleEditActivity,
  handleDeleteActivity,
  deletingId,
}) => [
  {
  header: "#",
  body: serialBody,
  style: {
    width: "40px",
    minWidth: "40px",
    maxWidth: "40px",
    textAlign: "center",
  },
  headerStyle: {
    width: "40px",
    minWidth: "40px",
    maxWidth: "40px",
    textAlign: "center",
  },
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
  // {
  //   header: "Action",
  //   body: (row) => (
  //     <SDLActionButtons
  //       row={row}
  //       actions={getKraActivityActions({
  //         handleEditActivity,
  //         handleDeleteActivity,
  //         deletingId,
  //       })}
  //     />
  //   ),
  //   style: { width: "140px", textAlign: "center" },
  // },
  {
  header: "Action",
  body: (row) => (
    <div className="d-flex align-items-center justify-content-center gap-2">
      <EditButton
        onClick={() => handleEditActivity(row)}
        ariaLabel="Edit KRA Activity"
      />

      <DeleteButton
        onClick={() => handleDeleteActivity(row)}
        loading={deletingId === row.ID}
        ariaLabel="Delete KRA Activity"
      />
    </div>
  ),
  style: {
    width: "40px",
    minWidth: "40px",
    maxWidth: "40px",
    textAlign: "center",
  },
  headerStyle: {
    width: "40px",
    minWidth: "40px",
    maxWidth: "40px",
    textAlign: "center",
  },
},
];