/**
 * File sharing feature — notifies peers when a file is uploaded to Supabase Storage.
 *
 * File data is stored in Supabase Storage (not sent over data channel).
 * Only metadata notifications travel over WebRTC.
 */
import type { RoomFeatureHandler, DataChannelMessage } from '../types';
import { logger } from '../../../utils/logger';

export interface FileSharedPayload {
  assetId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  uploadedBy: string;
}

type FileSharedCallback = (payload: FileSharedPayload) => void;

export function createFileSharingHandler(
  onFileShared: FileSharedCallback,
): RoomFeatureHandler {
  return {
    id: 'files',

    onMessage: (msg: DataChannelMessage) => {
      if (msg.type !== 'file-shared') return;
      const payload = msg.payload as FileSharedPayload;
      logger.info(`[FileSharing] New file shared: ${payload.fileName}`);
      onFileShared(payload);
    },
  };
}
