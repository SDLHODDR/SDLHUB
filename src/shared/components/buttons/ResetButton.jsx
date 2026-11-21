import "./resetButton.css";

/*
 * The one Reset button for every page (both portals): solid navy, refresh icon, fixed size.
 * Use this instead of a hand-made button so the size and colour stay the same everywhere.
 */
const ResetButton = ({
  onClick,
  disabled = false,
  className = "",
  children = "Reset",
  ...props
}) => (
  <button
    type="button"
    className={`btn btn-secondary sdl-reset-btn ${className}`.trim()}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    <i className="ti ti-refresh me-1" />
    {children}
  </button>
);

export default ResetButton;
