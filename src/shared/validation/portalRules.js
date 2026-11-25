/*
 * Portal-specific validation rules.
 *
 * Every validator looks here for the current portal (worked out from the URL,
 * e.g. /hrms/... -> "hrms", or passed as options.portal) and merges what it
 * finds over the defaults. Options passed by a form override both.
 *
 *   defaults (messages.js)  <  PORTAL_RULES[portal][type]  <  PORTAL_RULES[portal]["type.variant"]  <  options
 *
 * Keys are validator types: email, mobile, pincode, pan, tan, aadhaar, ifsc,
 * digits, pattern, length, time, required. A "type.variant" key applies only
 * when a form passes { variant: "..." }, e.g. validateEmail(v, { variant: "company" }).
 *
 * Anything a validator accepts as an option can be set here:
 *   label, messages: { required, invalid, ... }, allowedDomains, blockedDomains,
 *   digits, minDigits, maxDigits, allowCountryCode, min, max ...
 *
 * Adding a portal: add its key (same as the first URL segment) with the rules it needs.
 * Portals with no entry simply use the defaults.
 *
 * Examples (uncomment / adapt):
 *
 *   hrms: {
 *     // Custom wording for every email field in HRMS
 *     email: { messages: { invalid: "Enter the email in name@domain.com format." } },
 *
 *     // Only company addresses for fields that ask for { variant: "company" }
 *     "email.company": {
 *       allowedDomains: ["sdlindia.com"],
 *       messages: { domain: "Please use your @sdlindia.com email address." },
 *     },
 *   },
 *
 *   newportal: {
 *     email: { allowedDomains: ["sdl.com"] },        // every email field accepts @sdl.com only
 *     mobile: { allowCountryCode: true, minDigits: 10, maxDigits: 15 },
 *   },
 */

export const PORTAL_RULES = {
  eportal: {},

  hrms: {},

  careers: {
    // Candidates register from anywhere: optional "+" country code, 10-15 digits
    mobile: { allowCountryCode: true, minDigits: 10, maxDigits: 15 },
  },
};
