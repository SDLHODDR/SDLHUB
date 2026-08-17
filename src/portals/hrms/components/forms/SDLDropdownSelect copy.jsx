import { useCallback, useState, useRef } from "react";
import { Dropdown } from "primereact/dropdown";

/**
 * Generic searchable / creatable dropdown.
 *
 * Drop-in replacement for a raw <select>, built on PrimeReact's Dropdown
 * (same component family used for the Organogram picker) so styling stays
 * consistent across the app.
 *
 * Only `options` / `value` / `onChange` are expected to change per usage —
 * every caller normalizes its data to { id, label } before passing it in
 * (same pattern as `masterOptions` in KRAActivity today), so this component
 * never needs to know field names from the backend.
 *
 * Usage:
 *   <SDLDropdownSelect
 *     id="kraMaster"
 *     label="KRA Master"
 *     required
 *     options={masterOptions}          // [{ id, label }, ...]
 *     value={formData.KRA_ID}
 *     onChange={(id, option) => { ... }}
 *     invalid={!!errors.KRA_ID}
 *     errorMessage={errors.KRA_ID}
 *     allowAddNew
 *     onAddNew={handleAddNewKRAMaster}
 *     onFilterChange={handleKRAMasterSearch}
 *   />
 */
const SDLDropdownSelect = ({
  id,
  label,
  options = [],
  value,
  onChange, // (id, selectedOption) => void
  placeholder = "Select",
  disabled = false,
  invalid = false,
  errorMessage,
  required = false,
  allowAddNew = false,
  onAddNew, // async (typedText) => { id, label } | null
  onFilterChange, // (text) => void  -- for live-search extensions (e.g. KRA Activity search)
  className = "w-100",
  filter = true,
  showClear = true,
}) => {
  const [filterValue, setFilterValue] = useState("");
  const [adding, setAdding] = useState(false);
  const filterTextRef = useRef("");

  const handleFilter = useCallback(
    (e) => {
      const text = e.filter ?? "";
      filterTextRef.current = text;
      setFilterValue(text);
      onFilterChange?.(text);
    },
    [onFilterChange],
  );

  const handleAddNew = useCallback(async () => {
    const typed = filterTextRef.current.trim();
    if (!onAddNew || !typed || adding) return;
    try {
      setAdding(true);
      const newOption = await onAddNew(typed);
      if (newOption) {
        onChange(newOption.id, newOption);
      }
    } catch (error) {
      console.error("Error adding new option:", error);
    } finally {
      setAdding(false);
    }
  }, [onAddNew, adding, onChange]);

  const emptyFilterMessage = allowAddNew ? (
    <div
      className="p-2 text-primary d-flex align-items-center gap-2"
      style={{ cursor: adding ? "default" : "pointer" }}
      // onMouseDown (not onClick) so this fires before the Dropdown blurs /
      // closes its panel on outside interaction.
      onMouseDown={(e) => {
        e.preventDefault();
        handleAddNew();
      }}
    >
      <i className={`fas ${adding ? "fa-spinner fa-spin" : "fa-plus-circle"}`} />
      {adding ? "Adding..." : `Add "${filterValue}" as new option`}
    </div>
  ) : (
    "No results found"
  );

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <Dropdown
        id={id}
        value={value}
        options={options}
        optionLabel="label"
        optionValue="id"
        onChange={(e) => {
          const selected = options.find((opt) => opt.id === e.value);
          onChange(e.value, selected);
        }}
        filter={filter}
        onFilter={handleFilter}
        emptyFilterMessage={emptyFilterMessage}
        placeholder={placeholder}
        disabled={disabled || adding}
        showClear={showClear}
        className={`${className} ${invalid ? "p-invalid" : ""}`}
      />
      {invalid && errorMessage && (
        <div className="invalid-feedback d-block">{errorMessage}</div>
      )}
    </div>
  );
};

export default SDLDropdownSelect;
