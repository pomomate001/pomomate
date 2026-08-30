/**
 * Task synchronization feature.
 *
 * Host broadcasts room task list. Members update their local view.
 */
import { useTaskStore, useRoomStore } from '../../../state';
import type { RoomFeatureHandler, DataChannelMessage } from '../types';
import type { Task } from '../../../types';

export function createTaskSyncHandler(isHost: boolean): RoomFeatureHandler {
  return {
    id: 'tasks',

    onMessage: (msg: DataChannelMessage) => {
      if (msg.type !== 'task-sync' || isHost) return;

      const { currentRoom } = useRoomStore.getState();
      if (!currentRoom || msg.senderId !== currentRoom.hostId) {
        return; // Reject messages from non-hosts
      }

      const tasks = msg.payload as Task[];
      useTaskStore.getState().setTasks(tasks);
    },
  };
}

/** Snapshot current tasks for broadcasting. */
export function getTaskSyncPayload(): Task[] {
  return useTaskStore.getState().tasks;
}
