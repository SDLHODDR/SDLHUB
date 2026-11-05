export const parseOracleDate = (value) => {
  if (!value) return null;

  // Already a Date object
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  // Oracle-style dates:
  // 18-AUG-26
  // 18-AUG-2026
  const oracleMatch = trimmed.match(
    /^(\d{1,2})-([A-Za-z]{3})-(\d{2}|\d{4})$/
  );

  if (oracleMatch) {
    const [, day, monthText, yearText] = oracleMatch;

    const months = {
      JAN: 0,
      FEB: 1,
      MAR: 2,
      APR: 3,
      MAY: 4,
      JUN: 5,
      JUL: 6,
      AUG: 7,
      SEP: 8,
      OCT: 9,
      NOV: 10,
      DEC: 11,
    };

    const month = months[monthText.toUpperCase()];

    if (month === undefined) {
      return null;
    }

    let year = Number(yearText);

    if (yearText.length === 2) {
      year += year >= 50 ? 1900 : 2000;
    }

    const date = new Date(year, month, Number(day));

    return isNaN(date.getTime()) ? null : date;
  }

  // Fallback for standard date strings
  const parsed = new Date(trimmed);

  return isNaN(parsed.getTime()) ? null : parsed;
};
