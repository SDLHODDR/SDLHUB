import { buildCharset, hasInvalidChars } from "./charsets";
import { PORTAL_RULES } from "./portalRules";
import { currentPortal } from "./portal";

/*
 * Input filters: clean a value while the user types (onChange).
 *
 *   const { value, error } = filterInput(e.target.value, {
 *     allow: "letters", spaces: true, extra: ".'-_(),", maxLength: 50,
 *   })
 *   // value: disallowed characters removed and cut to 50
 *   // error: "Only letters, spaces and . ' - _ , ( ) are allowed" / "Maximum 50 characters are allowed" / ""
 *
 * Options: allow, spaces, extra, decimal (see charsets.js), maxLength,
 *          messages: { invalid, decimal, max } (string or (ctx) => string),
 *          portal / variant (PORTAL_RULES[portal].filterInput / "filterInput.variant").
 *
 * When several problems happen at once the length message wins, then the
 * decimal-point message, then the invalid-character message.
 */

const DEFAULT_FILTER_MESSAGES = {
  invalid: ({ describe }) => (describe ? `Only ${describe} are allowed` : "Spaces are not allowed"),
  decimal: "Only one decimal point is allowed",
  max: ({ max, onlyDigits }) => `Maximum ${max} ${onlyDigits ? "digits" : "characters"} are allowed`,
};

const resolveFilterOptions = (options) => {
  const rules = PORTAL_RULES[options.portal ?? currentPortal()] || {};
  const base = rules.filterInput || {};
  const variant = options.variant ? rules[`filterInput.${options.variant}`] || {} : {};

  return {
    ...base,
    ...variant,
    ...options,
    messages: { ...DEFAULT_FILTER_MESSAGES, ...base.messages, ...variant.messages, ...options.messages },
  };
};

const render = (template, ctx) =>
  typeof template === "function"
    ? template(ctx)
    : String(template).replace(/\{(\w+)\}/g, (m, k) => (ctx[k] !== undefined ? String(ctx[k]) : m));

export const filterInput = (rawValue, options = {}) => {
  const opts = resolveFilterOptions(options);
  const charset = buildCharset(opts);
  const input = String(rawValue ?? "");
  const ctx = { describe: charset.describe, onlyDigits: charset.onlyDigits, max: opts.maxLength };

  let error = "";
  let value = input;

  if (hasInvalidChars(input, charset)) {
    error = render(opts.messages.invalid, ctx);
    value = value.replace(charset.invalidChar, "");
  }

  if (opts.decimal) {
    const parts = value.split(".");
    if (parts.length > 2) {
      error = render(opts.messages.decimal, ctx);
      value = `${parts[0]}.${parts.slice(1).join("")}`; // keep the first decimal point
    }
  }

  if (opts.maxLength !== undefined && value.length > opts.maxLength) {
    error = render(opts.messages.max, ctx);
    value = value.slice(0, opts.maxLength);
  }

  return { value, error };
};

/*
 * For inputs that refuse a keystroke instead of cleaning it:
 *   if (!isAllowedInput(e.target.value, { allow: "digits" })) { showError(); return }
 */
export const isAllowedInput = (value, options = {}) => {
  const { value: cleaned } = filterInput(value, options);
  return cleaned === String(value ?? "");
};
