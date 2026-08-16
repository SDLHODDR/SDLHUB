export const getKraActivityActions = ({
  handleEditActivity,
  handleDeleteActivity,
  deletingId,
}) => [
  {
    key: "edit",
    label: "Edit KRA Activity",
    icon: "ti ti-edit",
    className: "btn-outline-primary",
    onClick: handleEditActivity,
  },
  {
    key: "delete",
    label: "Delete KRA Activity",
    icon: "ti ti-trash",
    className: "btn-outline-danger",
    onClick: handleDeleteActivity,
    loading: (row) => deletingId === row.ID,
  },
];