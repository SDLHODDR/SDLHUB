const EditButton = ({
  onClick,
  className = "",
  ariaLabel = "Edit",
  iconClassName = "ti ti-edit",
    style,
  ...props
}) => {
  return (
    <button
      type="button"
      className={`btn btn-sm btn-outline-primary sdl-icon-btn ${className}`.trim()}
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      {...props}
      style={style}
    >
      <i className={iconClassName} />
    </button>
  );
};

export default EditButton;
