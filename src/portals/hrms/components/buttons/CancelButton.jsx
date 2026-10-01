const CancelButton = ({
  onClick,
  disabled = false,
  className = "",
  children = "Cancel",
  ...props
}) => {
  return (
    <button
      type="button"
      className={`btn btn-secondary ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default CancelButton;