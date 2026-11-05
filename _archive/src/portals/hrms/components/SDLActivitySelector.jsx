import React from "react";

/**
 * Reusable "select activity" dropdown + form/table toggle button.
 * Used by KRA Activity, Department Activity, Question Master, Capabilities.
 *
 * The component only owns markup + fixed width/truncation behavior.
 * Each page supplies its own onChange/onToggleView so page-specific
 * logic (extra args, resetForm-on-open, isSubmitting guards) stays
 * where it belongs — in that page's own handler.
 */
const SDLActivitySelector = ({
  items = [],
  value,
  onChange,                          // (value) => void
  getOptionValue = (item) => item.ID,
  getOptionLabel = (item) => item.label,
  placeholder = "Select Activity",
  loading = false,
  showAll,
  onToggleView,                      // () => void — full toggle handler, owned by page
  showToggleLabel = false, //true,
  width = 240, // single source of truth, same default everywhere
}) => {
  const selectedItem = items.find((i) => String(getOptionValue(i)) === String(value));

  return (
    <div className="d-flex align-items-center gap-2">
      <select
        className="form-select sdl-activity-select"
        style={{ width, minWidth: width, maxWidth: width, flex: `0 0 ${width}px` }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        title={selectedItem ? getOptionLabel(selectedItem) : ""}
      >
        <option value="">{placeholder}</option>
        {items.map((item) => (
          <option key={getOptionValue(item)} value={getOptionValue(item)}>
            {getOptionLabel(item)}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="btn btn-outline-secondary d-flex align-items-center gap-2 sdl-toggle-btn"
        onClick={onToggleView}
      >
        <i className={`fas ${showAll ? "fa-edit" : "fa-table"}`} />
        {showToggleLabel && (showAll ? "Form" : "Table")}
      </button>
    </div>
  );
};

export default SDLActivitySelector;