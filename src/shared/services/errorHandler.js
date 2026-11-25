import { notifyError } from "./alertService";
import { API_MESSAGES } from "./apiMessages";

/*
 * Common error handling for catch blocks in every portal.
 *
 *   try {
 *     await saveDepartment(payload)
 *   } catch (error) {
 *     handleError(error, { context: "Save department", fallback: "Unable to save the department." })
 *   }
 *
 * - Shows the server's message when there is one (eportalRequest / hrmsRequest / axios),
 *   otherwise `fallback`. Code errors (TypeError, ...) never reach the user as-is.
 * - Logs the full error with `context` so it can be traced in the console.
 * - Ignores cancelled requests (page closed / request replaced).
 * - The same message within a few seconds is shown once, so a page whose
 *   several loads all fail shows one popup, not five.
 *
 * Options:
 *   context   label for the console log, e.g. "Load departments"
 *   fallback  message when the error has no usable message (default: "Something went wrong...")
 *   message   always show this message (ignore the server's)
 *   notify    false = log only, no popup (e.g. optional background data)
 *   onError   (message, error) => void, e.g. to put the message in an inline alert
 *
 * Returns the message (or "" for a cancelled request), so it can also be
 * shown inline: setError(handleError(error, { notify: false }))
 */

export const isCancelledError = (error) =>
  Boolean(
    error?.cancelled ||
      error?.code === "ERR_CANCELED" ||
      error?.name === "CanceledError" ||
      error?.name === "AbortError"
  );

/* The message to show for an error, or `fallback` when it has none fit for users. */
export const getErrorMessage = (error, fallback = API_MESSAGES.UNKNOWN) => {
  if (!error) return fallback;
  if (typeof error === "string") return error || fallback;

  // Rejected redux thunk payload / anything that carries a message meant for users
  if (error.userMessage) return String(error.userMessage);

  // Thrown by shared/services/request.js: message is already user-friendly
  if (error.status !== undefined && error.message) return error.message;

  // Raw axios error
  const data = error.response?.data;
  if (data?.message) return String(data.message);
  if (typeof data?.error === "string" && data.error) return data.error;

  // API returned { status: false, message } and the caller threw it
  if (error.isApiError && error.message) return error.message;

  if (!error.response && error.request) return API_MESSAGES.NETWORK;

  return fallback;
};

const RECENT_MS = 3000;
let lastShown = { text: "", at: 0 };

export const handleError = (error, options = {}) => {
  const { context = "Error", fallback, message, notify = true, onError } = options;

  if (isCancelledError(error)) return "";

  const text = message || getErrorMessage(error, fallback);

  console.error(`[${context}]`, error);

  if (notify) {
    const now = Date.now();
    if (text !== lastShown.text || now - lastShown.at > RECENT_MS) {
      notifyError(text);
      lastShown = { text, at: now };
    }
  }

  onError?.(text, error);

  return text;
};

/*
 * For API responses with { status: false, message } that should be handled
 * by the same catch block:
 *   const res = await saveX()
 *   if (!res?.status) throw apiError(res, "Unable to save.")
 */
export const apiError = (response, fallback = API_MESSAGES.UNKNOWN) => {
  const err = new Error(response?.message || fallback);
  err.isApiError = true;
  err.data = response;
  return err;
};
