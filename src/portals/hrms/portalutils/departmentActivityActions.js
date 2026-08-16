export const getDepartmentActivityActions = ({
  handleEditActivity,
  handleDeleteActivity,
  deletingId,
}) => [
  {
    key: "edit",
    label: "Edit Department Activity",
    icon: "ti ti-edit",
    className: "btn-outline-primary",
    onClick: handleEditActivity,
  },
  {
    key: "delete",
    label: "Delete Department Activity",
    icon: "ti ti-trash",
    className: "btn-outline-danger",
    onClick: handleDeleteActivity,
    loading: (row) => deletingId === row.ID,
  },
];