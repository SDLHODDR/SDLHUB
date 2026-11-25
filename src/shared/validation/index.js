/*
 * Common form validation for every portal.
 *
 *   import { validateEmail, validateMobile, validateFields } from "../../shared/validation";
 *
 * - validators.js   on-save validators (email, mobile, pincode, PAN, TAN, Aadhaar, IFSC, digits, decimal, text, pattern, length, time)
 * - inputFilters.js while-typing filters (filterInput, isAllowedInput)
 * - charsets.js     allowed-character sets shared by filterInput and validateText
 * - messages.js     default messages and labels
 * - portalRules.js  per-portal messages and rules (e.g. HRMS wording, @company-only email)
 * - patterns.js     the regular expressions
 */

export * from "./validators";
export { filterInput, isAllowedInput } from "./inputFilters";
export { PATTERNS } from "./patterns";
export { DEFAULT_MESSAGES, DEFAULT_LABELS } from "./messages";
export { PORTAL_RULES } from "./portalRules";
