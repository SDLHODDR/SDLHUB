import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../portals/hrms/assets/sdldropselect.css";
// Checkbox-driven multi-select, styled after PrimeReact's MultiSelect with
// a filter box (see the "Profile" / "Department" reference screens):
//   - Closed control shows rectangular chips for whatever's selected, plus
//     a clear-all (x) and chevron. Click anywhere on it to open the panel.
//   - Panel header: a "select all" checkbox + a dedicated search box (own
//     magnifier icon + its own clear button) — separate from the closed
//     control, matching the reference screens.
//   - Every option keeps its own checkbox and STAYS in the list whether
//     selected or not (selected rows just get a checked box + tinted row).
//     Clicking the row or the checkbox both toggle that option.
//
// Usage:
//   <SDLTagSelect
//     id="profileSelect"
//     label="Profile"
//     options={profileList}          // [{ id, label }]
//     value={formData.PROFILE_IDS}   // array of selected ids
//     onChange={(newIds) => setFormData(prev => ({ ...prev, PROFILE_IDS: newIds }))}
//     placeholder="Please Select"
//     disabled={lookupsLoading}
//   />
const SDLTagSelect = ({
  id,
  label,
  options = [], // [{ id, label }]
  value = [], // array of selected ids
  onChange, // (newIdArray) => void
  placeholder = "Please Select",
  searchPlaceholder = "Search...",
  disabled = false,
  invalid = false,
  errorMessage = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedSet = useMemo(() => new Set((value ?? []).map(String)), [value]);

  const labelFor = (idVal) =>
    options.find((opt) => String(opt.id) === String(idVal))?.label ?? idVal;

  // Options stay visible whether selected or not — only text search filters
  // the list; selection state is shown via the checkbox + row tint.
  const filteredOptions = useMemo(() => {
    if (!searchText.trim()) return options;
    const q = searchText.trim().toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, searchText]);

  const allFilteredSelected =
    filteredOptions.length > 0 && filteredOptions.every((opt) => selectedSet.has(String(opt.id)));

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleOpen = useCallback(() => {
    if (disabled) return;
    setIsOpen((open) => !open);
    setSearchText(""); // panel always opens with a fresh search box
  }, [disabled]);

  const toggleOption = useCallback(
    (idVal) => {
      const key = String(idVal);
      if (selectedSet.has(key)) {
        onChange((value ?? []).filter((v) => String(v) !== key));
      } else {
        onChange([...(value ?? []), idVal]);
      }
    },
    [selectedSet, value, onChange],
  );

  const toggleSelectAll = useCallback(() => {
    const filteredIds = filteredOptions.map((opt) => opt.id);
    if (allFilteredSelected) {
      const filteredKeys = new Set(filteredIds.map(String));
      onChange((value ?? []).filter((v) => !filteredKeys.has(String(v))));
    } else {
      const existingKeys = new Set((value ?? []).map(String));
      const toAdd = filteredIds.filter((idVal) => !existingKeys.has(String(idVal)));
      onChange([...(value ?? []), ...toAdd]);
    }
  }, [filteredOptions, allFilteredSelected, value, onChange]);

  const removeChip = useCallback(
    (idToRemove, e) => {
      e.stopPropagation();
      onChange((value ?? []).filter((v) => String(v) !== String(idToRemove)));
    },
    [value, onChange],
  );

  const clearAll = useCallback(
    (e) => {
      e.stopPropagation();
      onChange([]);
    },
    [onChange],
  );

  const clearSearch = useCallback(() => {
    setSearchText("");
    searchInputRef.current?.focus();
  }, []);

  return (
    <div className="mb-3 position-relative" ref={wrapperRef}>
      {label && (
        <label className="form-label" htmlFor={id}>
          {label}
        </label>
      )}

      <div
        id={id}
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={[
          "sdl-multi-control",
          isOpen ? "sdl-open" : "",
          invalid ? "sdl-select-invalid" : "",
          disabled ? "sdl-select-disabled" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={handleToggleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggleOpen();
          } else if (e.key === "Escape") {
            setIsOpen(false);
          }
        }}
      >
        <div className="sdl-multi-chips">
          {(value ?? []).length === 0 ? (
            <span className="sdl-placeholder">{placeholder}</span>
          ) : (
            (value ?? []).map((idVal) => (
              <span key={idVal} className="sdl-token-rect">
                {labelFor(idVal)}
                {!disabled && (
                  <button
                    type="button"
                    className="sdl-token-remove"
                    onClick={(e) => removeChip(idVal, e)}
                    aria-label={`Remove ${labelFor(idVal)}`}
                  >
                    <i className="fas fa-times" />
                  </button>
                )}
              </span>
            ))
          )}
        </div>

        <div className="sdl-multi-actions">
          {!disabled && (value ?? []).length > 0 && (
            <button type="button" className="sdl-multi-clear" onClick={clearAll} aria-label="Clear all">
              <i className="fas fa-times" />
            </button>
          )}
          <i className={`fas fa-chevron-${isOpen ? "up" : "down"} sdl-select-chevron-static`} />
        </div>
      </div>

      {invalid && errorMessage && <div className="sdl-invalid-feedback">{errorMessage}</div>}

      {isOpen && !disabled && (
        <div className="sdl-select-panel position-absolute w-100" style={{ zIndex: 1050, top: "100%" }}>
          <div className="sdl-select-search-row">
            <input
              type="checkbox"
              className="sdl-checkbox"
              checked={allFilteredSelected}
              onChange={toggleSelectAll}
              aria-label="Select all"
              title="Select all"
            />
            <div className="sdl-select-search-box">
              <input
                ref={searchInputRef}
                type="text"
                autoFocus
                autoComplete="off"
                className="sdl-select-search-input"
                placeholder={searchPlaceholder}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
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
            {filteredOptions.length === 0 ? (
              <div className="sdl-select-empty">No matches</div>
            ) : (
              filteredOptions.map((opt) => {
                const checked = selectedSet.has(String(opt.id));
                return (
                  <div
                    key={opt.id}
                    className={`sdl-select-option-row ${checked ? "sdl-selected" : ""}`}
                    onClick={() => toggleOption(opt.id)}
                  >
                    <input
                      type="checkbox"
                      className="sdl-checkbox"
                      checked={checked}
                      onChange={() => toggleOption(opt.id)}
                      onClick={(e) => e.stopPropagation()} // avoid double-toggle with the row's onClick
                    />
                    <span>{opt.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SDLTagSelect;
