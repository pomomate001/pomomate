/**
 * File sharing feature — notifies peers when a file is uploaded to Supabase Storage.
 *
 * File data is stored in Supabase Storage (not sent over data channel).
 * Only metadata notifications travel over WebRTC.
 */
import type { RoomFeatureHandler, DataChannelMessage } from '../types';
import { logger } from '../../../utils/logger';
import { useRoomStore } from '../../../state/roomStore';

export interface FileSharedPayload {
  action?: 'add' | 'setActive' | 'remove' | 'sync_request' | 'sync_response';
  assetId?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  storagePath?: string;
  uploadedBy?: string;
  file?: {
    id: string;
    uri: string;
    fileName: string;
    fileType: string;
    sharedBy: string;
  };
  fileId?: string | null;
  files?: {
    id: string;
    uri: string;
    fileName: string;
    fileType: string;
    sharedBy: string;
  }[];
  activeSharedFileId?: string | null;
}

type FileSharedCallback = (payload: FileSharedPayload) => void;

export function createFileSharingHandler(
  onFileShared?: FileSharedCallback,
): RoomFeatureHandler {
  return {
    id: 'files',

    onMessage: (msg: DataChannelMessage) => {
      if (msg.type !== 'file-shared') return;
      const payload = msg.payload as FileSharedPayload;
      logger.info(`[FileSharing] Data channel file event: ${payload.action || 'legacy'}`);

      // 1. Add file
      if (payload.action === 'add' && payload.file) {
        useRoomStore.getState().addSharedFile(payload.file);
        if (payload.fileId) {
          useRoomStore.getState().setActiveSharedFileId(payload.fileId);
        }
      }
      // 2. Set active presentation file
      else if (payload.action === 'setActive') {
        useRoomStore.getState().setActiveSharedFileId(payload.fileId ?? null);
      }
      // 3. Remove file
      else if (payload.action === 'remove' && payload.fileId) {
        useRoomStore.getState().removeSharedFile(payload.fileId);
      }
      // 4. Batch sync response
      else if (payload.action === 'sync_response' && payload.files) {
        useRoomStore.getState().setSharedFiles(payload.files);
        if (payload.activeSharedFileId !== undefined) {
          useRoomStore.getState().setActiveSharedFileId(payload.activeSharedFileId);
        }
      }

      if (onFileShared) {
        onFileShared(payload);
      }
    },
  };
}
