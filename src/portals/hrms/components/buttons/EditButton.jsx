const EditButton = ({
  onClick,
  className = "",
  ariaLabel = "Edit Department",
  iconClassName = "ti ti-edit",
  ...props
}) => {
  return (
    <button
      type="button"
      className={`btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center ${className}`.trim()}
      onClick={onClick}
      aria-label={ariaLabel}
      {...props}
    >
      <i className={iconClassName} />
    </button>
  );
};

export default EditButton;
