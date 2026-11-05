import { ariaLabel } from "primereact/api";

const ViewToggleButton = ({
  showAll,
  onClick,
  disabled = false,
  ariaLabel="Table view",
  className = "",
  ...props
}) => {
  return (
    <button
      type="button"
      className={`btn btn-outline-secondary d-flex align-items-center justify-content-center ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "38px",
        height: "38px",
        padding: 0,
      }}
      aria-label={showAll ? "Switch to form view" : "Switch to table view"}
      title={ariaLabel}
      title={showAll ? "Switch to form view" : "Switch to table view"}
      {...props}
    >
      <i className={`fas ${showAll ? "fa-edit" : "fa-table"}`} />
    </button>
  );
};

export default ViewToggleButton;