/*
 * Regular expressions shared by every portal.
 * Use them through the validators in ./validators.js rather than directly,
 * so messages and portal rules stay in one place.
 */

export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PINCODE: /^\d{6}$/,
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]$/i,
  TAN: /^[A-Z]{4}[0-9]{5}[A-Z]$/i,
  AADHAAR: /^[2-9]\d{11}$/,
  IFSC: /^[A-Z0-9]+$/,
  DIGITS: /^\d+$/,
  TIME_24H: /^([01]\d|2[0-3]):[0-5]\d$/,
};
