// Mirrors kraActivityActions.js's shape — one action array consumed by
// SDLActionButtons. Only "Edit" for now; extend here if a delete/view
// action is needed later.
export const getOrganogramActions = ({ onEdit }) => [
  {
    key: "edit",
    icon: "ti ti-edit",
    className: "btn-outline-primary",
    label: "Edit Organogram",
    onClick: (row) => onEdit?.(row.ID),
  },
];