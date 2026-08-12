const CancelButton = ({ onClick, className = "", children = "Cancel", ...props }) => {
  return (
    <button type="button" className={`btn btn-secondary ${className}`.trim()} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export default CancelButton;
