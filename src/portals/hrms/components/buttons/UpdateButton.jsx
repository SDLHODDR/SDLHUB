const UpdateButton = ({
  onClick,
  disabled = false,
  isSubmitting = false,
  className = "",
  children = "Update",
  ...props
}) => {
  return (
    <button
      type="button"
      className={`btn btn-primary ${className}`.trim()}
      onClick={onClick}
      disabled={disabled || isSubmitting}
      {...props}
    >
      {isSubmitting ? "Processing..." : children}
    </button>
  );
};

export default UpdateButton;