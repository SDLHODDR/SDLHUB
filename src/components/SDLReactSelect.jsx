import Select from "react-select";
import CreatableSelect from "react-select/creatable";

const baseStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "38px",
    height: "38px",
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
  }),
  input: (base) => ({
    ...base,
    fontSize: "13px",
  }),
  singleValue: (base) => ({
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
    fontSize: "13px",
    backgroundColor: state.isSelected
      ? "#ff9800"
      : state.isFocused
        ? "#fff3e0"
        : "#fff",
    color: state.isSelected ? "#fff" : "#212529",
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

// Required whenever menuPortalTarget is used — react-select renders the
// portaled menu with its own stacking context, so zIndex on the base
// "menu" key alone won't reach it; it must be set on "menuPortal".
const menuStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

/**
 * Thin wrapper around react-select that behaves like a native <select>:
 * - value: raw id/string (not an {value,label} object)
 * - onChange(value, option): receives the raw id/string, plus the full
 *   {value,label} option as a second arg for callers that need the label
 *   too (e.g. to also store a description field). Existing callers that
 *   only read the first argument are unaffected.
 *
 * Optional "add new" support (opt-in, used by KRA Activity's KRA Master
 * field): pass `allowAddNew` + `onAddNew` to switch this into a Creatable
 * select. When the typed text doesn't match any option, react-select shows
 * a "Create '<text>'" row; picking it calls onAddNew(text), which must
 * return a promise resolving to { value, label } (or null/undefined to
 * abort). The new option is then treated as selected via onChange.
 * Every other caller that doesn't pass onAddNew gets the plain Select as
 * before, so this is fully backward compatible.
 */
const SDLReactSelect = ({
  value,
  options,
  onChange,
  placeholder = "Please Select",
  hasError = false,
  isClearable = true,
  isLoading = false,
  isDisabled = false,
  allowAddNew = false,
  onAddNew,
  onFilterChange,
  isCreating = false,
  notifyFilterOnSelect = false, // opt-in: also call onFilterChange(label) on click-select, not just on typing
}) => {
  const selectedOption =
    options.find((opt) => String(opt.value) === String(value)) || null;

  const handleChange = (selectedOpt, actionMeta) => {
    onChange(selectedOpt ? selectedOpt.value : "", selectedOpt || null);

    if (actionMeta?.action === "clear") {
      onFilterChange?.("");
    } else if (
      notifyFilterOnSelect &&
      actionMeta?.action === "select-option" &&
      selectedOpt
    ) {
      onFilterChange?.(selectedOpt.label);
    }
  };

  const handleInputChange = (text, meta) => {
    if (meta.action === "input-change") onFilterChange?.(text);
  };

  const handleCreate = async (inputValue) => {
    if (!onAddNew) return;
    const newOption = await onAddNew(inputValue);
    if (newOption) {
      onChange(newOption.value ?? newOption.id, newOption);
    }
  };

  if (allowAddNew) {
    return (
      <CreatableSelect
        value={selectedOption}
        options={options}
        onChange={handleChange}
        onCreateOption={handleCreate}
        onInputChange={handleInputChange}
        isLoading={isLoading || isCreating}
        formatCreateLabel={(inputValue) => `Add new "${inputValue}"`}
        placeholder={placeholder}
        isClearable={isClearable}
        isDisabled={isDisabled}
        styles={{ ...getStyles(hasError), ...menuStyles }}
        menuPortalTarget={document.body}
        menuPosition="fixed"
      />
    );
  }

  return (
    <Select
      value={selectedOption}
      options={options}
      onChange={handleChange}
      onInputChange={handleInputChange}
      placeholder={placeholder}
      isClearable={isClearable}
      isLoading={isLoading}
      isDisabled={isDisabled}
      styles={{ ...getStyles(hasError), ...menuStyles }}
      menuPortalTarget={document.body}
      menuPosition="fixed"
    />
  );
};

export default SDLReactSelect;