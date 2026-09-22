// const DeleteButton = ({
//   onClick,
//   disabled = false,
//   loading = false,
//   className = "",
//   ariaLabel = "Delete Department",
//   iconClassName = "ti ti-trash",
//   ...props
// }) => {
//   return (
//     <button
//       type="button"
//       className={`btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center ${className}`.trim()}
//       aria-label={ariaLabel}
//       onClick={onClick}
//       disabled={disabled || loading}
//       {...props}
//     >
//       {loading ? (
//         <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
//       ) : (
//         <i className={iconClassName} />
//       )}
//     </button>
//   );
// };

// export default DeleteButton;

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
      className={`btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center ${className}`.trim()}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
      style={{
    width: "32px",
    height: "32px",
    padding: 0,
  }}
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
