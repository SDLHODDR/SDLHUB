import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../../assets/css/sdldropselect.css";

/**
 * Click-to-open searchable / creatable dropdown, styled after PrimeReact's
 * Dropdown with a filter box (see the "Employee" / "Department" reference
 * screens): the closed control just displays the selected label — it is
 * NOT a text input. Opening it reveals a separate search box (with its own
 * magnifier icon) inside the panel, and the option list below it.
 *
 * This replaces the earlier type-ahead-combobox version of this component
 * (where the main box doubled as both value display and search input).
 * That version is still supported visually via the legacy `.sdl-select-input`
 * CSS classes if you have other pages still using it, but new usages should
 * expect this click-to-open behavior.
 *
 * The option list is rendered through a React portal into document.body and
 * positioned via the control's screen coordinates (position: fixed), so it
 * always escapes ancestor overflow:hidden/auto clipping and z-index fights —
 * same reasoning as before, just now anchored to a div instead of an input.
 *
 * Usage:
 *   <SDLDropdownSelect
 *     id="employee"
 *     label="Employee"
 *     options={employeeOptions}        // [{ id, label }, ...]
 *     value={formData.EMP_ID}
 *     onChange={(id, option) => { ... }}
 *     invalid={!!errors.EMP_ID}
 *     errorMessage={errors.EMP_ID}
 *     allowAddNew
 *     onAddNew={handleAddNewEmployee}
 *     onFilterChange={handleEmployeeSearch}
 *   />
 */
const SDLDropdownSelect = ({
  id,
  label,
  options = [],
  value,
  onChange, // (id, selectedOption) => void
  placeholder = "Please Select",
  searchPlaceholder = "Search...",
  disabled = false,
  invalid = false,
  errorMessage,
  required = false,
  allowAddNew = false,
  onAddNew, // async (typedText) => { id, label } | null
  onFilterChange, // (text) => void  -- fired on every search keystroke AND on selection
  wrapperClassName = "mb-3", // override to "" for compact/inline placements
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [adding, setAdding] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null); // { top, left, width }

  const wrapperRef = useRef(null); // label + control, stays in normal document flow
  const controlRef = useRef(null); // the clickable closed box
  const searchInputRef = useRef(null);
  const menuRef = useRef(null); // portal content, lives in document.body

  const selectedOption = options.find((opt) => String(opt.id) === String(value));

  // Compute the portal menu's screen position from the control's own
  // bounding box. Re-run whenever the menu opens, and keep it in sync on
  // scroll/resize while open (capture:true so it catches scrolling inside
  // ANY inner scrollable ancestor, not just the window).
  const updateMenuPosition = useCallback(() => {
    if (!controlRef.current) return;
    const rect = controlRef.current.getBoundingClientRect();
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

  // Close the panel on outside click. Checks BOTH the control wrapper and
  // the portal menu, since the menu lives in a separate DOM subtree under
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

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setIsOpen((open) => !open);
    setSearchText(""); // panel always opens with a fresh search box
  }, [disabled]);

  const filteredOptions = searchText.trim()
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchText.trim().toLowerCase()))
    : options;

  const handleSearchChange = useCallback(
    (e) => {
      const text = e.target.value;
      setSearchText(text);
      onFilterChange?.(text); // drives the caller's table filter, keystroke by keystroke
    },
    [onFilterChange],
  );

  const clearSearch = useCallback(() => {
    setSearchText("");
    onFilterChange?.("");
    searchInputRef.current?.focus();
  }, [onFilterChange]);

  const handleSelectOption = useCallback(
    (option) => {
      setIsOpen(false);
      setSearchText("");
      onChange(option.id, option);
      onFilterChange?.(option.label); // selection also drives the table filter
    },
    [onChange, onFilterChange],
  );

  const handleAddNew = useCallback(async () => {
    const typed = searchText.trim();
    if (!onAddNew || !typed || adding) return;
    try {
      setAdding(true);
      const newOption = await onAddNew(typed);
      if (newOption) {
        handleSelectOption(newOption); // new option behaves exactly like a normal selection
      }
    } catch (error) {
      console.error("Error adding new option:", error);
    } finally {
      setAdding(false);
    }
  }, [onAddNew, adding, searchText, handleSelectOption]);

  const showAddNewRow = allowAddNew && searchText.trim() && filteredOptions.length === 0;

  return (
    <div className={wrapperClassName} ref={wrapperRef}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}

      <div
        id={id}
        ref={controlRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={[
          "sdl-select-control",
          isOpen ? "sdl-open" : "",
          invalid ? "sdl-select-invalid" : "",
          disabled ? "sdl-select-disabled" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          } else if (e.key === "Escape") {
            setIsOpen(false);
          }
        }}
      >
        <span className={selectedOption ? "sdl-value" : "sdl-placeholder"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <i className={`fas fa-chevron-${isOpen ? "up" : "down"} sdl-select-chevron-static`} />
      </div>

      {invalid && errorMessage && <div className="sdl-invalid-feedback">{errorMessage}</div>}

      {isOpen &&
        !disabled &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            className="sdl-select-panel"
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
              // Higher than Bootstrap modals (1055) / PrimeReact overlays,
              // so it always wins regardless of what else is on screen.
              zIndex: 1080,
            }}
          >
            <div className="sdl-select-search-row">
              <div className="sdl-select-search-box">
                <input
                  ref={searchInputRef}
                  type="text"
                  autoFocus
                  autoComplete="off"
                  className="sdl-select-search-input"
                  placeholder={searchPlaceholder}
                  value={searchText}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setIsOpen(false);
                  }}
                />
                {searchText && (
                  <button type="button" className="sdl-select-search-clear" onClick={clearSearch}>
                    <i className="fas fa-times" />
                  </button>
                )}
                <i className="fas fa-search sdl-select-search-icon" />
              </div>
            </div>

            <div className="sdl-select-list">
              {filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="sdl-select-option"
                  // onMouseDown (not onClick) so the option is picked before
                  // the search input's blur / outside-click handler can close the panel.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectOption(option);
                  }}
                >
                  {option.label}
                </button>
              ))}

              {!filteredOptions.length && !showAddNewRow && (
                <div className="sdl-select-empty">No results found</div>
              )}

              {showAddNewRow && (
                <button
                  type="button"
                  className="sdl-select-addnew"
                  disabled={adding}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleAddNew();
                  }}
                >
                  <i className={`fas ${adding ? "fa-spinner fa-spin" : "fa-plus-circle"}`} />
                  {adding ? "Adding..." : `Add "${searchText.trim()}" as new option`}
                </button>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default SDLDropdownSelect;
