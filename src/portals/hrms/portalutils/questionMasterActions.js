export const getQuestionMasterActions = ({
  handleEdit,
  handleDelete,
  deletingId,
}) => [
  {
    key: "edit",
    label: "Edit Question",
    icon: "ti ti-edit",
    className: "btn-outline-primary",
    onClick: handleEdit,
  },
  {
    key: "delete",
    label: "Delete Question",
    icon: "ti ti-trash",
    className: "btn-outline-danger",
    onClick: handleDelete,
    loading: (row) => deletingId === row.ID,
  },
];