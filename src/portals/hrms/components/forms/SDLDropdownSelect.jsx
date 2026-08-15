import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
 * The option list is rendered through a React portal into document.body and
 * positioned via the input's screen coordinates (position: fixed), instead
 * of being a normal absolutely-positioned child of the form. A plain child
 * gets clipped by ANY ancestor with overflow:hidden/auto (card-body,
 * table-responsive, etc.) and can lose z-index stacking fights with
 * siblings — a portal sidesteps both, the same way PrimeReact's own overlay
 * panels work.
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
  wrapperClassName = "mb-3", // override to "" for compact/inline placements
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null); // { top, left, width }

  const wrapperRef = useRef(null); // label + input, stays in normal document flow
  const inputRef = useRef(null);
  const menuRef = useRef(null); // portal content, lives in document.body
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

  // Compute the portal menu's screen position from the input's own
  // bounding box. Re-run whenever the menu opens, and keep it in sync on
  // scroll/resize while open (capture:true so it catches scrolling inside
  // ANY inner scrollable ancestor, not just the window).
  const updateMenuPosition = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom, // position: fixed, so viewport-relative — no scrollY offset needed
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;
    updateMenuPosition();
    window.addEventListener("scroll", updateMenuPosition, true);
    window.addEventListener("resize", updateMenuPosition);
    return () => {
      window.removeEventListener("scroll", updateMenuPosition, true);
      window.removeEventListener("resize", updateMenuPosition);
    };
  }, [isOpen, updateMenuPosition]);

  // Close the panel on outside click. Checks BOTH the input wrapper and the
  // portal menu, since the menu lives in a separate DOM subtree under
  // document.body and wouldn't be "contained" by wrapperRef.
  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedWrapper = wrapperRef.current?.contains(e.target);
      const clickedMenu = menuRef.current?.contains(e.target);
      if (!clickedWrapper && !clickedMenu) {
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
    <div className={wrapperClassName} ref={wrapperRef}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}

      <input
        id={id}
        ref={inputRef}
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

      {isOpen &&
        !disabled &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            className="dropdown-menu show shadow-sm"
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
              maxHeight: "240px",
              overflowY: "auto",
              // Higher than Bootstrap modals (1055) / PrimeReact overlays,
              // so it always wins regardless of what else is on screen.
              zIndex: 1080,
            }}
          >
            {filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className="dropdown-item"
                // onMouseDown (not onClick) so the option is picked before
                // the input's blur / outside-click handler can close the panel.
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
          </div>,
          document.body,
        )}
    </div>
  );
};

export default SDLDropdownSelect;