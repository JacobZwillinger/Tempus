/**
 * ISO week date utilities for Tempus.
 * All week calculations follow ISO 8601.
 */

export interface ISOWeek {
  isoYear: number;
  isoWeek: number;
}

/**
 * Get the ISO week number and ISO year for a given date.
 * ISO weeks start on Monday. Week 1 contains the first Thursday of the year.
 */
export function getISOWeek(date: Date): ISOWeek {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number (Monday=1, Sunday=7)
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return {
    isoYear: d.getUTCFullYear(),
    isoWeek: Math.min(weekNo, 52), // Clamp week 53 → 52
  };
}

/**
 * Get the current ISO week.
 */
export function getCurrentISOWeek(): ISOWeek {
  return getISOWeek(new Date());
}

/**
 * Calculate which grid column (year index) and row (week index) a given ISO week falls into,
 * relative to a birthdate.
 */
export function weekToGridPosition(
  birthdate: Date,
  isoYear: number,
  isoWeek: number
): { col: number; row: number } | null {
  const birthWeek = getISOWeek(birthdate);
  const yearDiff = isoYear - birthWeek.isoYear;

  // Simple mapping: col = year offset from birth year, row = week - 1
  const col = yearDiff;
  const row = isoWeek - 1; // 0-indexed

  if (col < 0 || row < 0 || row >= 52) return null;
  return { col, row };
}

/**
 * Given a grid position (col=year index, row=week index), return the ISO year and week.
 */
export function gridPositionToWeek(
  birthdate: Date,
  col: number,
  row: number
): ISOWeek {
  const birthWeek = getISOWeek(birthdate);
  return {
    isoYear: birthWeek.isoYear + col,
    isoWeek: row + 1, // 1-indexed
  };
}

/**
 * Determine the week state.
 */
export type WeekState = "future" | "past-empty" | "past-filled" | "current";

export function getWeekState(
  isoYear: number,
  isoWeek: number,
  currentWeek: ISOWeek,
  hasFill: boolean
): WeekState {
  if (isoYear > currentWeek.isoYear) return "future";
  if (isoYear === currentWeek.isoYear && isoWeek > currentWeek.isoWeek) return "future";
  if (isoYear === currentWeek.isoYear && isoWeek === currentWeek.isoWeek) return "current";
  return hasFill ? "past-filled" : "past-empty";
}

/**
 * Build the week key used for storage lookups.
 */
export function weekKey(isoYear: number, isoWeek: number): string {
  return `${isoYear}-W${String(isoWeek).padStart(2, "0")}`;
}
