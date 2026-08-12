const SaveButton = ({
  onClick,
  disabled = false,
  isSubmitting = false,
  isEditing = false,
  className = "",
  children,
  ...props
}) => {
  const label = children || (isEditing ? "Update" : "Save");

  return (
    <button
      type="button"
      className={`btn btn-primary ${className}`.trim()}
      onClick={onClick}
      disabled={disabled || isSubmitting}
      {...props}
    >
      {isSubmitting ? "Processing..." : label}
    </button>
  );
};

export default SaveButton;
