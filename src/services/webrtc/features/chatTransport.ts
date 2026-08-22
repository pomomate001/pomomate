/**
 * Chat transport feature — sends/receives chat messages via data channel.
 */
import { useChatStore } from '../../../state';
import type { RoomFeatureHandler, DataChannelMessage } from '../types';
import type { Message } from '../../../types';

export function createChatTransportHandler(): RoomFeatureHandler {
  return {
    id: 'chat',

    onMessage: (msg: DataChannelMessage) => {
      if (msg.type !== 'chat') return;
      const chatMsg = msg.payload as Message;
      useChatStore.getState().addMessage(chatMsg);
    },
  };
}
