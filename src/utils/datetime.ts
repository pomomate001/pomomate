/**
 * Date/time helpers.
 */
import type { ISODateString } from '../types';

/** Current time as an ISO-8601 string. */
export function nowIso(): ISODateString {
  return new Date().toISOString();
}

/** Parses an ISO string into a Date (throws on invalid input). */
export function parseIso(value: ISODateString): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ISO date string: ${value}`);
  }
  return date;
}

/** Returns date as YYYY-MM-DD in local timezone (avoids UTC offset shifts). */
export function toLocalDateStr(d?: Date): string {
  const date = d || new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

