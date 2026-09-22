const SDLInput = ({
  label,
  required = false,
  type = "text",
  value = "",
  onChange,
  error = "",
  maxLength,
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <div>
      {label && (
        <label className="form-label">
          {label}
          {required && (
            <span className="text-danger ms-1">*</span>
          )}
        </label>
      )}

      <input
        type={type}
        className={`form-control ${error ? "is-invalid" : ""} ${className}`.trim()}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        disabled={disabled}
        {...props}
      />

      {error && (
        <div className="invalid-feedback">
          {error}
        </div>
      )}
    </div>
  );
};

export default SDLInput;