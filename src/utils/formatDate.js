/**
 * formatDate
 * Convert an ISO 8601 string to a localized, human-readable date.
 * Example output: "July 7, 2025".
 * @param {string} isoString - A valid ISO 8601 date string (e.g. "2025-07-07T12:34:56Z").
 * @returns {string} Formatted date string in the user's locale.
 */
export function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
