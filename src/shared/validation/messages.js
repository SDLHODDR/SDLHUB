/*
 * Default validation messages, used when neither the portal (portalRules.js)
 * nor the calling form passes its own.
 *
 * Placeholders, filled by the validator:
 *   {label}  field name as given, e.g. "personal email"
 *   {Label}  same with a capital first letter, for the start of a sentence
 *   {domains}, {min}, {max}, {digits}  rule values
 *
 * A message can also be a function: (ctx) => string, where ctx holds the
 * same values (label, domains, min, max, digits, value).
 */

export const DEFAULT_MESSAGES = {
  required: {
    required: "{Label} is required.",
  },
  email: {
    required: "{Label} is required.",
    invalid: "Please enter a valid {label}.",
    domain: "Please enter an email address ending with {domains}.",
    blockedDomain: "Email addresses from this domain are not allowed.",
  },
  mobile: {
    required: "{Label} is required.",
    invalid: "Please enter a valid {digits} digit {label}.",
  },
  pincode: {
    required: "{Label} is required.",
    invalid: "Please enter a valid 6 digit {label}.",
  },
  pan: {
    required: "{Label} is required.",
    invalid: "Please enter a valid {label}.",
  },
  tan: {
    required: "{Label} is required.",
    invalid: "Please enter a valid {label}.",
  },
  aadhaar: {
    required: "{Label} is required.",
    digitsOnly: "{Label} must contain only digits.",
    length: "{Label} must be 12 digits.",
    invalid: "Please enter a valid {label}.",
  },
  ifsc: {
    required: "{Label} is required.",
    invalid: "Please enter a valid {label}.",
  },
  digits: {
    required: "{Label} is required.",
    invalid: "Please enter a number only.",
    min: "{Label} must be at least {min} digits.",
    max: "{Label} can be up to {max} digits.",
    range: "{Label} must be between {minValue} and {maxValue}.",
  },
  decimal: {
    required: "{Label} is required.",
    invalid: "Please enter a valid {label}.",
  },
  text: {
    required: "{Label} is required.",
    invalid: "{Label} can contain only {allowed}.",
    min: "{Label} must be at least {min} characters.",
    max: "{Label} cannot exceed {max} characters.",
  },
  pattern: {
    required: "{Label} is required.",
    invalid: "Please enter a valid {label}.",
  },
  length: {
    required: "{Label} is required.",
    min: "{Label} must be at least {min} characters.",
    max: "{Label} can be up to {max} characters.",
  },
  time: {
    required: "{Label} is required.",
    invalid: "Please enter a valid time (HH:MM).",
  },
};

/* Default field labels, used in the messages above. */
export const DEFAULT_LABELS = {
  required: "this field",
  email: "email address",
  mobile: "mobile number",
  pincode: "pincode",
  pan: "PAN number",
  tan: "TAN number",
  aadhaar: "Aadhaar number",
  ifsc: "IFSC",
  digits: "this field",
  decimal: "number",
  text: "this field",
  pattern: "value",
  length: "this field",
  time: "time",
};
