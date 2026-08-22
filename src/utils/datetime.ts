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
