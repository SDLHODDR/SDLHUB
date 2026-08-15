import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Generic searchable / creatable combobox.
 *
 * Deliberately NOT built on PrimeReact's Dropdown filter — that filter box
 * resets itself on selection/close and can't be set programmatically, which
 * made it impossible to guarantee:
 *   1. Selecting an option writes that option's label into the search box.
 *   2. Selecting an option (or typing) drives the caller's `onFilterChange`.
 *   3. A guaranteed "Add new" row appears whenever nothing matches.
 *
 * This is a small self-contained combobox instead: one <input> that is both
 * the search box AND the display of the current selection, plus an
 * absolutely-positioned option list. Full control over all three behaviors.
 *
 * Only `options` / `value` / `onChange` are expected to change per usage —
 * every caller normalizes its data to { id, label } before passing it in.
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
  onFilterChange, // (text) => void  -- fired on every keystroke AND on selection
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const containerRef = useRef(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Sync displayed text FROM the parent's `value` — only when `value`
  // itself changes (edit-mode load, form reset, etc.), never when the
  // background `options` list happens to refresh. This is what stops a
  // stray refetch from wiping out text the user is actively typing.
  useEffect(() => {
    if (!value) {
      setQuery("");
      return;
    }
    const match = optionsRef.current.find((opt) => String(opt.id) === String(value));
    if (match) setQuery(match.label);
  }, [value]);

  // Close the panel on outside click.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = query.trim()
    ? options.filter((opt) => opt.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  const handleInputChange = useCallback(
    (e) => {
      const text = e.target.value;
      setQuery(text);
      setIsOpen(true);
      onFilterChange?.(text); // (1/2) every keystroke drives the caller's table filter
    },
    [onFilterChange],
  );

  const handleSelectOption = useCallback(
    (option) => {
      setQuery(option.label); // (1) selection lands in the search box
      setIsOpen(false);
      onChange(option.id, option);
      onFilterChange?.(option.label); // (2) selection also drives the table filter
    },
    [onChange, onFilterChange],
  );

  const handleAddNew = useCallback(async () => {
    const typed = query.trim();
    if (!onAddNew || !typed || adding) return;
    try {
      setAdding(true);
      const newOption = await onAddNew(typed);
      if (newOption) {
        handleSelectOption(newOption); // (3) new option behaves exactly like a normal selection
      }
    } catch (error) {
      console.error("Error adding new KRA Master:", error);
    } finally {
      setAdding(false);
    }
  }, [onAddNew, adding, query, handleSelectOption]);

  const showAddNewRow = allowAddNew && query.trim() && filteredOptions.length === 0;

  return (
    <div className="mb-3 position-relative" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}

      <input
        id={id}
        type="text"
        autoComplete="off"
        className={`form-control ${invalid ? "is-invalid" : ""} ${className}`}
        placeholder={placeholder}
        value={query}
        disabled={disabled || adding}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
      />
      {invalid && errorMessage && <div className="invalid-feedback">{errorMessage}</div>}

      {isOpen && !disabled && (
        <div
          className="dropdown-menu show w-100 shadow-sm"
          style={{ maxHeight: "240px", overflowY: "auto", top: "100%" }}
        >
          {filteredOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className="dropdown-item"
              // onMouseDown (not onClick) so the option is picked before the
              // input's onBlur / outside-click handler can close the panel.
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectOption(option);
              }}
            >
              {option.label}
            </button>
          ))}

          {!filteredOptions.length && !showAddNewRow && (
            <span className="dropdown-item-text text-muted">No results found</span>
          )}

          {showAddNewRow && (
            <button
              type="button"
              className="dropdown-item text-primary d-flex align-items-center gap-2"
              disabled={adding}
              onMouseDown={(e) => {
                e.preventDefault();
                handleAddNew();
              }}
            >
              <i className={`fas ${adding ? "fa-spinner fa-spin" : "fa-plus-circle"}`} />
              {adding ? "Adding..." : `Add "${query.trim()}" as new KRA Master`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SDLDropdownSelect;
