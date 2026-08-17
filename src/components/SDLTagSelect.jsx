import { useMemo, useRef, useState, useEffect } from "react";

// Chip-based multi-select with inline search/filter, styled to match a
// combobox: chips + text cursor share one bordered box, dropdown list
// opens below on focus and filters as you type. Picking an item adds a
// chip and keeps the list open so multiple picks can be made in a row.
//
// Usage:
//   <SDLTagSelect
//     id="deptSelect"
//     label="Department"
//     options={departmentList}       // [{ id, label }]
//     value={formData.DEPT_ID}       // array of selected ids
//     onChange={(newIds) => setFormData(prev => ({ ...prev, DEPT_ID: newIds }))}
//     placeholder="Select Department"
//     disabled={lookupsLoading}
//   />
const SDLTagSelect = ({
  id,
  label,
  options = [], // [{ id, label }]
  value = [], // array of selected ids
  onChange, // (newIdArray) => void
  placeholder = "Search and select...",
  disabled = false,
  invalid = false,
  errorMessage = "",
}) => {
  const [filterText, setFilterText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const selectedSet = useMemo(
    () => new Set((value ?? []).map(String)),
    [value],
  );

  const availableOptions = useMemo(() => {
    const unselected = options.filter((opt) => !selectedSet.has(String(opt.id)));
    if (!filterText.trim()) return unselected;
    const q = filterText.trim().toLowerCase();
    return unselected.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, selectedSet, filterText]);

  const labelFor = (idVal) =>
    options.find((opt) => String(opt.id) === String(idVal))?.label ?? idVal;

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

  useEffect(() => {
    setHighlightIndex(0);
  }, [filterText, isOpen]);

  const handlePick = (opt) => {
    onChange([...(value ?? []), opt.id]);
    setFilterText("");
    inputRef.current?.focus(); // stay open, ready for next pick
  };

  const handleRemove = (idToRemove, e) => {
    e.stopPropagation();
    onChange((value ?? []).filter((v) => String(v) !== String(idToRemove)));
  };

  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
      setIsOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, availableOptions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = availableOptions[highlightIndex];
      if (opt) handlePick(opt);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Backspace" && !filterText && value?.length > 0) {
      // quick-remove last chip on backspace when input is empty
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="mb-3 position-relative" ref={wrapperRef}>
      {label && (
        <label className="form-label" htmlFor={id}>
          {label}
        </label>
      )}

      <div
        className={`form-control d-flex flex-wrap align-items-center gap-2 ${
          invalid ? "is-invalid" : ""
        } ${disabled ? "bg-light" : ""}`}
        style={{
          height: "auto",
          minHeight: "42px",
          paddingTop: "6px",
          paddingBottom: "6px",
          cursor: disabled ? "not-allowed" : "text",
          boxShadow: isOpen ? "0 0 0 0.2rem rgba(13,110,253,.25)" : "none",
          borderColor: isOpen ? "#86b7fe" : undefined,
        }}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {(value ?? []).map((idVal) => (
          <span
            key={idVal}
            className="badge rounded-pill d-flex align-items-center gap-2"
            style={{
              backgroundColor: "#2c6e75",
              color: "#fff",
              padding: "6px 10px",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}
          >
            {labelFor(idVal)}
            {!disabled && (
              <button
                type="button"
                className="btn-close btn-close-white"
                style={{ fontSize: "0.55rem" }}
                onClick={(e) => handleRemove(idVal, e)}
                aria-label={`Remove ${labelFor(idVal)}`}
              />
            )}
          </span>
        ))}

        <input
          ref={inputRef}
          id={id}
          type="text"
          className="border-0 flex-grow-1"
          style={{ outline: "none", minWidth: "120px" }}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value?.length === 0 ? placeholder : ""}
          disabled={disabled}
        />
      </div>

      {invalid && errorMessage && (
        <div className="invalid-feedback d-block">{errorMessage}</div>
      )}

      {isOpen && !disabled && (
        <ul
          className="list-group position-absolute w-100 shadow-sm"
          style={{ zIndex: 1050, maxHeight: "220px", overflowY: "auto", top: "100%" }}
        >
          {availableOptions.length === 0 ? (
            <li className="list-group-item text-muted small">No matches</li>
          ) : (
            availableOptions.map((opt, i) => (
              <li
                key={opt.id}
                className={`list-group-item list-group-item-action ${
                  i === highlightIndex ? "active" : ""
                }`}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHighlightIndex(i)}
                onMouseDown={(e) => e.preventDefault()} // keep focus on input
                onClick={() => handlePick(opt)}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default SDLTagSelect;
