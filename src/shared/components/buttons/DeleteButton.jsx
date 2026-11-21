const DeleteButton = ({
  onClick,
  disabled = false,
  loading = false,
  className = "",
  ariaLabel = "Delete",
  iconClassName = "ti ti-trash",
  ...props
}) => {
  return (
    <button
      type="button"
      className={`btn btn-sm btn-outline-danger sdl-icon-btn ${className}`.trim()}
      aria-label={ariaLabel}
      onClick={onClick}
      title={ariaLabel}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span
          className="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        ></span>
      ) : (
        <i className={iconClassName} />
      )}
    </button>
  );
};

export default DeleteButton;
