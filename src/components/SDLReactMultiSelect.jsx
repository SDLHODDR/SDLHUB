import Select, { components } from "react-select";

const baseStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "38px",
    borderColor: state.isFocused ? "#ff9800" : "#ced4da",
    boxShadow: state.isFocused
      ? "0 0 0 0.15rem rgba(255, 152, 0, 0.15)"
      : "none",
    fontSize: "13px",
    borderRadius: "4px",
    "&:hover": {
      borderColor: state.isFocused ? "#ff9800" : "#adb5bd",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "2px 8px",
    gap: "4px",
  }),
  input: (base) => ({
    ...base,
    fontSize: "13px",
  }),
  placeholder: (base) => ({
    ...base,
    fontSize: "13px",
    color: "#6c757d",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
    fontSize: "13px",
  }),
  option: (base, state) => ({
    ...base,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    backgroundColor: state.isFocused ? "#fff3e0" : "#fff",
    color: "#212529",
    cursor: "pointer",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#176b87",
    borderRadius: "3px",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#fff",
    fontSize: "12px",
    padding: "3px 6px",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#fff",
    borderRadius: "0 3px 3px 0",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.25)",
      color: "#fff",
    },
  }),


};

const getStyles = (hasError) => ({
  ...baseStyles,
  control: (base, state) => ({
    ...baseStyles.control(base, state),
    borderColor: hasError
      ? "#dc3545"
      : state.isFocused
        ? "#ff9800"
        : "#ced4da",
    boxShadow: hasError
      ? "0 0 0 0.15rem rgba(220, 53, 69, 0.10)"
      : state.isFocused
        ? "0 0 0 0.15rem rgba(255, 152, 0, 0.15)"
        : "none",
    "&:hover": {
      borderColor: hasError
        ? "#dc3545"
        : state.isFocused
          ? "#ff9800"
          : "#adb5bd",
    },
  }),
});

// Custom option row: checkbox + label, checkbox state driven by
// react-select's own isSelected (no extra state needed).
const CheckboxOption = (props) => (
  <components.Option {...props}>
    <input
      type="checkbox"
      checked={props.isSelected}
      onChange={() => {}} // click handled by the row itself, not the checkbox
      style={{ accentColor: "#ff9800", width: "14px", height: "14px" }}
    />
    <span>{props.label}</span>
  </components.Option>
);

/**
 * Multi-select counterpart to SDLReactSelect, with checkbox-style options.
 * - value: array of raw ids/strings
 * - onChange: receives an array of raw ids/strings directly
 */
const SDLReactMultiSelect = ({
  value = [],
  options,
  onChange,
  placeholder = "Please Select",
  hasError = false,
  isLoading = false,
  isDisabled = false,
}) => {
  const selectedOptions = options.filter((opt) =>
    value.some((v) => String(v) === String(opt.value)),
  );

  const handleChange = (selectedOpts) => {
    onChange((selectedOpts || []).map((opt) => opt.value));
  };

  return (
    <Select
      isMulti
      value={selectedOptions}
      options={options}
      onChange={handleChange}
      placeholder={placeholder}
      isLoading={isLoading}
      isDisabled={isDisabled}
      styles={getStyles(hasError)}
      components={{ Option: CheckboxOption }}
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
    />
  );
};

export default SDLReactMultiSelect;