// import SDLActionButtons from "../../../components/SDLActionButtons";
// import { getDepartmentActivityActions } from "./departmentActivityActions";
import EditButton from '../components/buttons/EditButton';
import DeleteButton from '../components/buttons/DeleteButton';

const serialBody = (rowData, options) =>
  options.rowIndex + 1 + (options.props.first || 0);

export const departmentActivityColumns = ({ handleEditActivity, handleDeleteActivity, deletingId }) => [
  {
    header: "#",
    body: serialBody,
    style: {
      width: '40px',
      minWidth: '40px',
      maxWidth: '40px',
      textAlign: 'center'
    },
    headerStyle: {
      width: '40px',
      minWidth: '40px',
      maxWidth: '40px',
      textAlign: 'center'
    },
  },
  {
    field: "DEPT_DESC",
    header: "Department",
    sortable: true,
    style: { width: "220px" },
  },
  // {
  //   field: "ACT_TYPE",
  //   header: "Type",
  //   sortable: true,
  //   style: { width: "120px" },
  // },
  {
    field: "ACT_TYPE_TEXT",
    header: "Type",
    sortable: true,
    body: (row) => row.ACT_TYPE_TEXT,
    style: { width: "110px", textAlign: "center" },
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
      // <div className="d-flex align-items-center justify-content-center gap-2">
      //   <button
      //     type="button"
      //     className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
      //     aria-label="Edit Department Activity"
      //     onClick={() => handleEditActivity(row)}
      //   >
      //     <i className="ti ti-edit" />
      //   </button>
      //   <button
      //     type="button"
      //     className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
      //     aria-label="Delete Department Activity"
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
      // <SDLActionButtons
      //   row={row}
      //   actions={getDepartmentActivityActions({
      //     handleEditActivity,
      //     handleDeleteActivity,
      //     deletingId,
      //   })}
      // />
      <div className="d-flex align-items-center justify-content-center gap-2">
      <EditButton
        onClick={() => handleEditActivity(row)}
        ariaLabel="Edit Department Activity"
      />

      <DeleteButton
        onClick={() => handleDeleteActivity(row)}
        loading={deletingId === row.ID}
        ariaLabel="Delete Department Activity"
      />
    </div>
    ),
    style: { width: "100px", textAlign: "center" },
  },
];