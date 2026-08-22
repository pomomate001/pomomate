/**
 * Abstract service interfaces.
 *
 * These contracts describe the domain operations the app needs, independent of
 * any backend. Concrete implementations (Supabase / REST) are provided in M03,
 * and auth/monetization specifics in M08. Keeping them abstract lets the UI and
 * state layers depend on interfaces, not implementations.
 */
import type {
  Message,
  Referral,
  Room,
  RoomMember,
  Subscription,
  Task,
  User,
} from '../types';

export interface AuthService {
  getCurrentUser(): Promise<User | null>;
  signInWithEmail(email: string, password: string): Promise<User>;
  signUpWithEmail(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  /** Returns the current access token, or null if unauthenticated (M08). */
  getAccessToken(): Promise<string | null>;
}

export interface RoomService {
  createRoom(input: { name: string }): Promise<Room>;
  getRoom(roomId: string): Promise<Room>;
  listActiveRooms(): Promise<Room[]>;
  joinRoom(roomId: string): Promise<RoomMember>;
  leaveRoom(roomId: string): Promise<void>;
  listMembers(roomId: string): Promise<RoomMember[]>;
}

export interface TaskService {
  listTasks(input?: { roomId?: string }): Promise<Task[]>;
  createTask(input: {
    title: string;
    roomId?: string | null;
  }): Promise<Task>;
  updateTask(taskId: string, patch: Partial<Task>): Promise<Task>;
  deleteTask(taskId: string): Promise<void>;
}

export interface ChatService {
  listMessages(roomId: string): Promise<Message[]>;
  sendMessage(input: { roomId: string; content: string }): Promise<Message>;
}

export interface SubscriptionService {
  getSubscription(userId: string): Promise<Subscription | null>;
  createReferral(input: { referredId: string }): Promise<Referral>;
  listReferrals(userId: string): Promise<Referral[]>;
}
