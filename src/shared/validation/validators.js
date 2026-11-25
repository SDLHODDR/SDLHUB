import { PATTERNS } from "./patterns";
import { DEFAULT_LABELS, DEFAULT_MESSAGES } from "./messages";
import { PORTAL_RULES } from "./portalRules";
import { currentPortal } from "./portal";
import { buildCharset, hasInvalidChars } from "./charsets";

/*
 * Common field validators for all portals (ePortal, HRMS, Careers, ...).
 *
 * Every validator has the same shape:
 *
 *   validateX(value, options) -> ""            when the value is valid
 *                             -> "message"     when it is not
 *
 * Common options (all optional):
 *   required   true = empty value is an error (default false: empty passes,
 *              so optional fields are checked only when filled in)
 *   label      field name used in messages, e.g. "personal email"
 *   message    one message for every failure of this field
 *   messages   per-failure messages, e.g. { required: "...", invalid: "..." }
 *              (string, or (ctx) => string)
 *   portal     portal key; defaults to the first URL segment (/hrms/... -> "hrms")
 *   variant    picks PORTAL_RULES[portal]["type.variant"], e.g. "company"
 *
 * Settings are merged: defaults < portal rules < portal variant rules < options.
 * See portalRules.js to change messages or rules for one portal.
 */

/* ---------- helpers ---------- */

const capitalise = (text) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : text;

const resolveOptions = (type, options = {}) => {
  const portal = options.portal ?? currentPortal();
  const rules = PORTAL_RULES[portal] || {};
  const base = rules[type] || {};
  const variant = options.variant ? rules[`${type}.${options.variant}`] || {} : {};

  return {
    ...base,
    ...variant,
    ...options,
    label: options.label ?? variant.label ?? base.label ?? DEFAULT_LABELS[type],
    messages: {
      ...DEFAULT_MESSAGES[type],
      ...base.messages,
      ...variant.messages,
      ...options.messages,
    },
  };
};

const formatMessage = (template, ctx) => {
  if (typeof template === "function") return template(ctx);

  return String(template ?? "").replace(/\{(\w+)\}/g, (match, key) => {
    if (key === "Label") return capitalise(ctx.label);
    return ctx[key] !== undefined ? String(ctx[key]) : match;
  });
};

/* Builds the error text for one failed rule. */
const fail = (opts, key, ctx = {}) => {
  const fullCtx = { ...ctx, label: opts.label };
  return formatMessage(opts.message ?? opts.messages[key] ?? opts.messages.invalid, fullCtx);
};

const toText = (value) => String(value ?? "").trim();

export const isEmpty = (value) =>
  value === null ||
  value === undefined ||
  (typeof value === "string" && value.trim() === "") ||
  (Array.isArray(value) && value.length === 0);

/*
 * Shared start of every validator: resolves options and handles empty values.
 * Returns { opts, text, done } - when done is a string, the validator returns it.
 */
const begin = (type, value, options) => {
  const opts = resolveOptions(type, options);
  const text = toText(value);

  if (text === "") {
    return { opts, text, done: opts.required ? fail(opts, "required") : "" };
  }

  return { opts, text, done: null };
};

/* ---------- validators ---------- */

export const validateRequired = (value, options = {}) => {
  const opts = resolveOptions("required", options);
  return isEmpty(value) ? fail(opts, "required") : "";
};

/*
 * Email.
 *   allowedDomains  ["sdlindia.com"] -> only name@sdlindia.com is accepted
 *   blockedDomains  ["gmail.com"]    -> these domains are rejected
 */
export const validateEmail = (value, options = {}) => {
  const { opts, text, done } = begin("email", value, options);
  if (done !== null) return done;

  if (!PATTERNS.EMAIL.test(text)) return fail(opts, "invalid");

  const domain = text.slice(text.lastIndexOf("@") + 1).toLowerCase();
  const allowed = (opts.allowedDomains || []).map((d) => String(d).replace(/^@/, "").toLowerCase());
  const blocked = (opts.blockedDomains || []).map((d) => String(d).replace(/^@/, "").toLowerCase());

  if (allowed.length && !allowed.includes(domain)) {
    return fail(opts, "domain", { domains: allowed.map((d) => `@${d}`).join(", ") });
  }

  if (blocked.includes(domain)) return fail(opts, "blockedDomain", { domain });

  return "";
};

/*
 * Mobile number.
 *   digits            exact digit count (default 10)
 *   minDigits/maxDigits  range instead of an exact count
 *   allowCountryCode  accept a leading "+"
 *   allowSeparators   ignore spaces and dashes
 */
export const validateMobile = (value, options = {}) => {
  const { opts, text, done } = begin("mobile", value, options);
  if (done !== null) return done;

  const min = opts.minDigits ?? opts.digits ?? 10;
  const max = opts.maxDigits ?? opts.digits ?? 10;

  let number = opts.allowSeparators ? text.replace(/[\s-]/g, "") : text;
  if (opts.allowCountryCode) number = number.replace(/^\+/, "");

  const ok = PATTERNS.DIGITS.test(number) && number.length >= min && number.length <= max;

  return ok ? "" : fail(opts, "invalid", { digits: min === max ? min : `${min}-${max}`, min, max });
};

export const validatePincode = (value, options = {}) => {
  const { opts, text, done } = begin("pincode", value, options);
  if (done !== null) return done;
  return PATTERNS.PINCODE.test(text) ? "" : fail(opts, "invalid");
};

export const validatePAN = (value, options = {}) => {
  const { opts, text, done } = begin("pan", value, options);
  if (done !== null) return done;
  return PATTERNS.PAN.test(text) ? "" : fail(opts, "invalid");
};

export const validateTAN = (value, options = {}) => {
  const { opts, text, done } = begin("tan", value, options);
  if (done !== null) return done;
  return PATTERNS.TAN.test(text) ? "" : fail(opts, "invalid");
};

/* Aadhaar: digits only, 12 digits, not starting with 0 or 1. */
export const validateAadhaar = (value, options = {}) => {
  const { opts, text, done } = begin("aadhaar", value, options);
  if (done !== null) return done;

  if (!PATTERNS.DIGITS.test(text)) return fail(opts, "digitsOnly");
  if (text.length !== 12) return fail(opts, "length");
  if (!PATTERNS.AADHAAR.test(text)) return fail(opts, "invalid");

  return "";
};

export const validateIFSC = (value, options = {}) => {
  const { opts, text, done } = begin("ifsc", value, options);
  if (done !== null) return done;
  return PATTERNS.IFSC.test(text) ? "" : fail(opts, "invalid");
};

/* Digits only, with optional min/max digit count. */
export const validateDigits = (value, options = {}) => {
  const { opts, text, done } = begin("digits", value, options);
  if (done !== null) return done;

  if (!PATTERNS.DIGITS.test(text)) return fail(opts, "invalid");
  if (opts.min !== undefined && text.length < opts.min) return fail(opts, "min", { min: opts.min });
  if (opts.max !== undefined && text.length > opts.max) return fail(opts, "max", { max: opts.max });

  const number = Number(text);
  const range = { minValue: opts.minValue, maxValue: opts.maxValue };
  if (opts.minValue !== undefined && number < opts.minValue) return fail(opts, "range", range);
  if (opts.maxValue !== undefined && number > opts.maxValue) return fail(opts, "range", range);

  return "";
};

/*
 * Decimal number, e.g. an amount: validateDecimal(v, { maxIntDigits: 8, maxDecimals: 2 })
 * Without limits any "123" or "123.45" is accepted.
 */
export const validateDecimal = (value, options = {}) => {
  const { opts, text, done } = begin("decimal", value, options);
  if (done !== null) return done;

  const intPart = opts.maxIntDigits ? `\\d{1,${opts.maxIntDigits}}` : "\\d+";
  const decPart = opts.maxDecimals === 0 ? "" : `(\\.\\d{1,${opts.maxDecimals ?? ""}})?`;
  const pattern = new RegExp(`^${intPart}${decPart}$`);

  return pattern.test(text) ? "" : fail(opts, "invalid", { maxIntDigits: opts.maxIntDigits, maxDecimals: opts.maxDecimals });
};

/*
 * Free text limited to a character set and length (on save).
 *   validateText(v, { label: "JD label", allow: "letters", spaces: true, extra: ".'-_(),", max: 50 })
 * allow / spaces / extra / decimal are the same options as filterInput (see charsets.js),
 * so the field accepts the same characters while typing and on save.
 */
export const validateText = (value, options = {}) => {
  const { opts, text, done } = begin("text", value, options);
  if (done !== null) return done;

  const charset = buildCharset(opts);

  if (opts.max !== undefined && text.length > opts.max) return fail(opts, "max", { max: opts.max });
  if (opts.min !== undefined && text.length < opts.min) return fail(opts, "min", { min: opts.min });
  if (hasInvalidChars(text, charset)) return fail(opts, "invalid", { allowed: charset.describe });

  return "";
};

/* Any regular expression: validatePattern(v, { pattern: /^[A-Za-z]+$/, message: "Letters only." }) */
export const validatePattern = (value, options = {}) => {
  const { opts, text, done } = begin("pattern", value, options);
  if (done !== null) return done;
  return opts.pattern && !opts.pattern.test(text) ? fail(opts, "invalid") : "";
};

/* Text length: validateLength(v, { min: 3, max: 250 }) */
export const validateLength = (value, options = {}) => {
  const { opts, text, done } = begin("length", value, options);
  if (done !== null) return done;

  if (opts.min !== undefined && text.length < opts.min) return fail(opts, "min", { min: opts.min });
  if (opts.max !== undefined && text.length > opts.max) return fail(opts, "max", { max: opts.max });

  return "";
};

/* 24-hour time, HH:MM. allow24: also accept "24:00" (end of day). */
export const validateTime = (value, options = {}) => {
  const { opts, text, done } = begin("time", value, options);
  if (done !== null) return done;
  if (opts.allow24 && text === "24:00") return "";
  return PATTERNS.TIME_24H.test(text) ? "" : fail(opts, "invalid");
};

/* ---------- whole form ---------- */

/*
 * Runs a schema over a form's values and returns { field: "message" } for the
 * fields that failed (an empty object when everything is valid).
 *
 *   const errors = validateFields(form, {
 *     name:   [validateRequired, { label: "candidate name" }],
 *     email:  [validateEmail, { required: true }],
 *     mobile: [[validateRequired], [validateMobile, { allowCountryCode: true }]],
 *     recipientEmail: [validateEmail, { required: true, when: (v) => v.resignMode === "E" }],
 *     custom: (value, values) => (value > values.max ? "Too high." : ""),
 *   });
 *
 * Each field takes a [validator, options] pair, a list of pairs (first error
 * wins), or a function (value, values) => message. Options can also be a
 * function (values) => options for rules that depend on other fields.
 * `when: (values) => boolean` skips the rule when it returns false.
 */
export const validateFields = (values = {}, schema = {}) => {
  const errors = {};

  const runRule = (rule, value) => {
    if (typeof rule === "function") return rule(value, values) || "";

    const [validator, rawOptions = {}] = rule;
    const options = typeof rawOptions === "function" ? rawOptions(values) : rawOptions;

    if (options.when && !options.when(values)) return "";

    const rest = { ...options };
    delete rest.when;
    return validator(value, rest) || "";
  };

  Object.entries(schema).forEach(([field, rules]) => {
    const list =
      typeof rules === "function" || typeof rules[0] === "function" ? [rules] : rules;

    for (const rule of list) {
      const error = runRule(rule, values[field]);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });

  return errors;
};

export const hasErrors = (errors = {}) => Object.values(errors).some(Boolean);
