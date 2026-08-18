export const getCapabilitiesActions = ({
  handleEdit,
}) => [
  {
    key: "edit",
    label: "Edit",
    icon: "ti ti-edit",
    className: "btn-outline-primary",
    onClick: handleEdit,
  },
];