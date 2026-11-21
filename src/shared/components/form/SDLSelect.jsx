import { Children, Fragment, isValidElement } from "react";
import SDLReactSelect from "./SDLReactSelect";

/*
 * Drop-in replacement for a native <select> that renders the shared SDLReactSelect,
 * so every dropdown looks the same. Takes the same props a <select> does
 * (value, onChange(event), name, id, disabled, className with "is-invalid",
 * and <option> children) and calls onChange with an event-like
 * { target: { name, id, value } }, so existing handlers keep working.
 *
 * The <option value=""> (e.g. "Select") becomes the placeholder.
 */

const optionText = (children) =>
  Children.toArray(children)
    .map((c) => (typeof c === "string" || typeof c === "number" ? String(c) : ""))
    .join("")
    .trim();

const collectOptions = (children, out = []) => {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === Fragment) {
      collectOptions(child.props.children, out);
      return;
    }
    if (child.type === "option") {
      const value = child.props.value ?? optionText(child.props.children);
      out.push({
        value: String(value),
        label: optionText(child.props.children),
        isDisabled: !!child.props.disabled,
      });
    }
  });
  return out;
};

const SDLSelect = ({
  value,
  onChange,
  name,
  id,
  disabled = false,
  className = "",
  placeholder,
  isClearable = false,
  children,
}) => {
  const all = collectOptions(children);
  const empty = all.find((o) => o.value === "");
  const options = all.filter((o) => o.value !== "");
  const hasError = /\bis-invalid\b/.test(className);

  // Keep any page-specific classes on the wrapper; drop the native-select ones.
  const wrapperClass = className
    .split(/\s+/)
    .filter((c) => c && !["form-control", "form-select", "select2", "is-invalid", "form-control-sm", "form-select-sm"].includes(c))
    .join(" ");

  return (
    <div id={id} className={`sdl-select ${hasError ? "sdl-select-invalid" : ""} ${wrapperClass}`.replace(/\s+/g, " ").trim()}>
      <SDLReactSelect
        value={value ?? ""}
        options={options}
        onChange={(newValue) => {
          const v = newValue ?? "";
          onChange?.({
            target: { name, id, value: v },
            currentTarget: { name, id, value: v },
            preventDefault: () => {},
            persist: () => {},
          });
        }}
        placeholder={placeholder || empty?.label || "Select"}
        isClearable={isClearable}
        isDisabled={disabled}
        hasError={hasError}
      />
    </div>
  );
};

export default SDLSelect;
