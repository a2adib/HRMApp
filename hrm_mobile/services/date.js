/**
 * Calendar date as `YYYY-MM-DD`.
 *
 * Built from the local getters rather than `toISOString()`, which converts to
 * UTC and would report the previous day for anyone east of UTC in the early
 * hours — an employee checking in at 01:00 would be logged against yesterday.
 */
export const toIsoDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Turn `YYYY-MM-DD` back into something readable on screen. */
export const formatDisplayDate = (isoDate) => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  if (!day) return isoDate;
  return new Date(Number(year), Number(month) - 1, Number(day)).toDateString();
};

/** Clock time as `HH:MM` in 24-hour form, stable across device locales. */
export const formatTime = (isoTimestamp) => {
  if (!isoTimestamp) return '';
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return isoTimestamp;
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};
