/**
 * Room feature: Chat with sender name, date, and message deletion.
 */
import React, { useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore, useUserStore } from '../../../../state';
import { useColors } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { generateId } from '../../../../utils/id';
import { nowIso } from '../../../../utils/datetime';
import type { Message } from '../../../../types';

interface RoomChatProps {
  roomId: string;
}

export function RoomChat({ roomId }: RoomChatProps) {
  const allMessages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const deleteMessage = useChatStore((s) => s.deleteMessage);
  const user = useUserStore((s) => s.user);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList<Message>>(null);
  const colors = useColors();

  // Filter messages for current room
  const roomMessages = allMessages.filter(
    (m) => !m.roomId || m.roomId === roomId,
  );

  const currentUserId = user?.id ?? 'my-user';
  const currentUserName = user?.displayName ?? 'Ben';

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const msg: Message = {
      id: generateId(),
      roomId,
      userId: currentUserId,
      senderName: currentUserName,
      content: trimmed,
      timestamp: nowIso(),
    };

    addMessage(msg);
    setText('');
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [text, roomId, currentUserId, currentUserName, addMessage]);

  const handleDeleteMessage = useCallback(
    (messageId: string, messageUserId: string) => {
      // Only allow deleting own messages
      if (messageUserId !== currentUserId && messageUserId !== 'my-user') return;

      Alert.alert(
        'Mesajı Sil',
        'Bu mesajı silmek istediğinize emin misiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: () => deleteMessage(messageId),
          },
        ],
      );
    },
    [currentUserId, deleteMessage],
  );

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const time = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (isToday) return time;

    const day = date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    });
    return `${day} ${time}`;
  };

  return (
    <View style={styles.container}>
      {/* Chat header */}
      <View style={[styles.chatHeader, { borderBottomColor: colors.border }]}>
        <Ionicons name="chatbubbles" size={16} color={colors.primary} />
        <Text style={[typography.captionBold, { color: colors.textPrimary, marginLeft: 6 }]}>
          Oda Sohbeti
        </Text>
        <Text style={[typography.caption, { color: colors.textDisabled, marginLeft: 'auto' }]}>
          {roomMessages.length} mesaj
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={roomMessages}
        keyExtractor={(m) => m.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isMe = item.userId === currentUserId || item.userId === 'my-user';
          const senderDisplayName = item.senderName ?? item.userId.slice(0, 8);
          const timeFormatted = formatDate(item.timestamp);

          return (
            <Pressable
              onLongPress={() => handleDeleteMessage(item.id, item.userId)}
              delayLongPress={500}
              style={[styles.bubbleWrap, isMe ? styles.bubbleRight : styles.bubbleLeft]}
            >
              {!isMe && (
                <View style={[styles.avatarMini, { backgroundColor: colors.surfaceVariant }]}>
                  <Text style={[typography.overline, { color: colors.textSecondary }]}>
                    {senderDisplayName.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.msgBox,
                  {
                    backgroundColor: isMe ? colors.primary : colors.surfaceVariant,
                    borderBottomRightRadius: isMe ? 4 : radius.md,
                    borderBottomLeftRadius: !isMe ? 4 : radius.md,
                  },
                ]}
              >
                {/* Sender name (shown for others' messages) */}
                {!isMe && (
                  <Text
                    style={[
                      typography.captionBold,
                      { color: colors.primary, fontSize: 11, marginBottom: 2 },
                    ]}
                  >
                    {senderDisplayName}
                  </Text>
                )}

                <Text style={[typography.body, { color: isMe ? colors.textInverse : colors.textPrimary }]}>
                  {item.content}
                </Text>

                <Text
                  style={[
                    typography.caption,
                    {
                      color: isMe ? 'rgba(255,255,255,0.7)' : colors.textDisabled,
                      fontSize: 10,
                      alignSelf: 'flex-end',
                      marginTop: 2,
                    },
                  ]}
                >
                  {timeFormatted}
                </Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Ionicons name="chatbubbles-outline" size={36} color={colors.textDisabled} />
            <Text style={[typography.caption, { color: colors.textDisabled, marginTop: spacing.xs }]}>
              Sohbet henüz başlamadı. İlk mesajı sen gönder!
            </Text>
          </View>
        }
      />

      {/* Input bar */}
      <View style={[styles.inputRow, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Bir mesaj yazın…"
          placeholderTextColor={colors.textDisabled}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          style={[
            typography.body,
            styles.input,
            { color: colors.textPrimary, backgroundColor: colors.surfaceVariant },
          ]}
        />
        <Pressable
          onPress={handleSend}
          disabled={!text.trim()}
          style={[
            styles.sendBtn,
            { backgroundColor: text.trim() ? colors.primary : colors.surfaceVariant },
          ]}
        >
          <Ionicons
            name="send"
            size={16}
            color={text.trim() ? colors.textInverse : colors.textDisabled}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  bubbleWrap: {
    flexDirection: 'row',
    marginVertical: 3,
    alignItems: 'flex-end',
  },
  bubbleLeft: {
    justifyContent: 'flex-start',
  },
  bubbleRight: {
    justifyContent: 'flex-end',
  },
  avatarMini: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginBottom: 2,
  },
  msgBox: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    maxWidth: '80%',
  },
  emptyChat: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginRight: spacing.sm,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
