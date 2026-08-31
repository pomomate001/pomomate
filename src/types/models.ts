/**
 * PomoMate — Shared Domain Models
 *
 * Platform-agnostic TypeScript interfaces that describe the core business
 * entities. These are shared by mobile (M05) and web (M06) and consumed by
 * the state stores (src/state) and the API/services layer (src/services).
 *
 * NOTE (M01): These are pure type definitions only. No persistence, no
 * Supabase, and no WebRTC logic lives here — those are implemented in later
 * modules (M03, M04, M08).
 */

/** ISO-8601 timestamp string, e.g. "2026-01-01T12:00:00.000Z". */
export type ISODateString = string;

/** Unique identifier (UUID string in the backend). */
export type ID = string;

/* -------------------------------------------------------------------------- */
/* User                                                                       */
/* -------------------------------------------------------------------------- */

export type SubscriptionTier = 'free' | 'premium';

export interface User {
  id: ID;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  subscriptionTier: SubscriptionTier;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/* -------------------------------------------------------------------------- */
/* Room                                                                       */
/* -------------------------------------------------------------------------- */

/** Hard cap on room capacity as defined by the master architecture. */
export const MAX_ROOM_MEMBERS = 6 as const;

export interface Room {
  id: ID;
  name: string;
  hostId: ID;
  /** Maximum number of members allowed in the room (host-authoritative P2P). */
  maxMembers: typeof MAX_ROOM_MEMBERS;
  isActive: boolean;
  createdAt: ISODateString;
  /** Short invite code for room sharing (e.g. "X7A9P2"). */
  inviteCode?: string;
}

export type RoomMemberRole = 'host' | 'member';

export interface RoomMember {
  id: ID;
  roomId: ID;
  userId: ID;
  role: RoomMemberRole;
  joinedAt: ISODateString;
}

/* -------------------------------------------------------------------------- */
/* Task                                                                       */
/* -------------------------------------------------------------------------- */

export type RecurrenceType = 'none' | 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface TaskRecurrence {
  type: RecurrenceType;
  /** Custom days of the week, 0=Sun, 1=Mon, ..., 6=Sat. Only used if type is 'custom'. */
  customDays?: number[];
}

export interface Task {
  id: ID;
  userId: ID;
  /** Optional — a task may be scoped to a room or be personal. */
  roomId?: ID | null;
  title: string;
  completed: boolean;
  /** Number of completed pomodoro cycles associated with this task. */
  pomodoroCount: number;
  createdAt: ISODateString;
  /** Optional — tag/category for the task, e.g. "Matematik" */
  tag?: string | null;
  /** Target date in YYYY-MM-DD format. If omitted, applies to the created date. */
  targetDate?: string;
  /** Defines if and how this task repeats */
  recurrence?: TaskRecurrence | null;
}

/* -------------------------------------------------------------------------- */
/* Timer                                                                      */
/* -------------------------------------------------------------------------- */

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export interface TimerState {
  /** Configured length of the current mode, in seconds. */
  duration: number;
  /** Seconds left on the current interval. */
  remainingSeconds: number;
  isRunning: boolean;
  mode: TimerMode;
  /** Current cycle index within the pomodoro set. */
  currentCycle: number;
}

/* -------------------------------------------------------------------------- */
/* Message                                                                    */
/* -------------------------------------------------------------------------- */

export interface Message {
  id: ID;
  roomId: ID;
  userId: ID;
  senderName?: string;
  content: string;
  timestamp: ISODateString;
}

/* -------------------------------------------------------------------------- */
/* Subscription                                                               */
/* -------------------------------------------------------------------------- */

export interface Subscription {
  id: ID;
  userId: ID;
  tier: SubscriptionTier;
  /** Null for free tier / non-expiring plans. */
  expiresAt?: ISODateString | null;
}

/* -------------------------------------------------------------------------- */
/* Referral                                                                   */
/* -------------------------------------------------------------------------- */

export type ReferralStatus = 'pending' | 'completed' | 'expired';

export interface Referral {
  id: ID;
  referrerId: ID;
  referredId: ID;
  status: ReferralStatus;
  createdAt: ISODateString;
}
