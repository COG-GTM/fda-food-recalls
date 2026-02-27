import dayjs from 'dayjs';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Convert "Month YYYY" string to "YYYY-MM" format.
 */
export function parseMonthYear(dateStr) {
  const parts = dateStr.split(" ");
  const monthIndex = MONTH_NAMES.indexOf(parts[0]);
  if (monthIndex === -1) return dateStr;
  const month = String(monthIndex + 1).padStart(2, "0");
  return `${parts[1]}-${month}`;
}

/**
 * Generate a list of "Month YYYY" strings for a date range.
 */
export function generateDateRange(startYear = 2012, endYear = 2019, endMonth = 5) {
  const dateList = [];
  for (let year = startYear; year <= endYear; year++) {
    const maxMonth = year === endYear ? endMonth : 12;
    for (let month = 1; month <= maxMonth; month++) {
      dateList.push(`${MONTH_NAMES[month - 1]} ${year}`);
    }
  }
  return dateList;
}

/**
 * Format a date string (YYYYMMDD) to a readable format.
 */
export function formatDate(dateStr) {
  return dayjs(dateStr, "YYYYMMDD").format("LL");
}

/**
 * Find min and max dates from FDA API response data.
 */
export function findDateRange(responseData) {
  let max = 0;
  let min = Infinity;
  for (const item of responseData) {
    const date = parseFloat(item.recall_initiation_date);
    if (date > max) max = date;
    if (date < min) min = date;
  }
  return [max, min];
}
