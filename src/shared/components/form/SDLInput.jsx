import { useId } from "react";

const SDLInput = ({
  id,
  name,
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
  // Every field needs an id or name (browser autofill / DevTools check);
  // generate a unique id when the caller passes neither.
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && (
            <span className="text-danger ms-1">*</span>
          )}
        </label>
      )}

      <input
        id={inputId}
        name={name}
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