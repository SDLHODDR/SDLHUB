import SDLReactSelect from "./SDLReactSelect";

const pad2 = (n) => String(n).padStart(2, "0");
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({ value: pad2(i), label: pad2(i) }));
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => ({ value: pad2(i), label: pad2(i) }));

/**
 * 24-hour time as two themed dropdowns (HH and MM), same as the HRMS interview time.
 * value is "HH:MM" (extra ":SS" is ignored). Picking an hour with no minute fills "00",
 * so the value is never half-filled. onChange gets { target: { name, id, value } }
 * like a normal input, so existing handleChange functions work unchanged.
 */
const SDLTimeSelect = ({ name, id, value = "", onChange, disabled = false, hasError = false }) => {
  const [hour = "", minute = ""] = (value || "").split(":");

  const emit = (h, m) => {
    const next = h ? `${h}:${m || "00"}` : "";
    onChange?.({ target: { name, id: id || name, value: next } });
  };

  return (
    <div className="d-flex gap-2">
      <SDLReactSelect
        value={hour}
        options={HOUR_OPTIONS}
        onChange={(h) => emit(h, minute)}
        placeholder="HH"
        isDisabled={disabled}
        hasError={hasError}
        width="calc(50% - 4px)"
      />
      <SDLReactSelect
        value={hour ? minute : ""}
        options={MINUTE_OPTIONS}
        onChange={(m) => emit(hour || "00", m)}
        placeholder="MM"
        isDisabled={disabled}
        hasError={hasError}
        width="calc(50% - 4px)"
      />
    </div>
  );
};

export default SDLTimeSelect;
