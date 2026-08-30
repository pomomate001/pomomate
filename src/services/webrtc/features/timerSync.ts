/**
 * Timer synchronization feature.
 *
 * Host broadcasts timer state to all peers.
 * Members apply received state to their local timerStore.
 */
import { useTimerStore, useRoomStore } from '../../../state';
import type { RoomFeatureHandler, DataChannelMessage } from '../types';
import type { TimerMode } from '../../../types';

interface TimerSyncPayload {
  remainingSeconds: number;
  duration: number;
  isRunning: boolean;
  mode: TimerMode;
  currentCycle: number;
}

export function createTimerSyncHandler(isHost: boolean): RoomFeatureHandler {
  return {
    id: 'timer',

    onMessage: (msg: DataChannelMessage) => {
      if (msg.type !== 'timer-sync' || isHost) return;

      const { currentRoom } = useRoomStore.getState();
      if (!currentRoom || msg.senderId !== currentRoom.hostId) {
        return; // Reject messages from non-hosts
      }

      // Members apply host's timer state
      const payload = msg.payload as TimerSyncPayload;
      const store = useTimerStore.getState();

      if (payload.mode !== store.mode) {
        store.setMode(payload.mode);
      }

      // Direct state update for sync
      useTimerStore.setState({
        remainingSeconds: payload.remainingSeconds,
        duration: payload.duration,
        isRunning: payload.isRunning,
        currentCycle: payload.currentCycle,
      });
    },
  };
}

/** Create a timer state snapshot for broadcasting. */
export function getTimerSyncPayload(): TimerSyncPayload {
  const s = useTimerStore.getState();
  return {
    remainingSeconds: s.remainingSeconds,
    duration: s.duration,
    isRunning: s.isRunning,
    mode: s.mode,
    currentCycle: s.currentCycle,
  };
}
