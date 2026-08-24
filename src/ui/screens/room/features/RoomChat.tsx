/**
 * Room feature: Chat.
 */
import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, Pressable, StyleSheet } from 'react-native';
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
  const user = useUserStore((s) => s.user);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList<Message>>(null);
  const colors = useColors();

  // Filter messages for current room (or general room messages)
  const roomMessages = allMessages.filter(
    (m) => !m.roomId || m.roomId === roomId,
  );

  const currentUserId = user?.id ?? 'my-user';
  const currentUserName = user?.displayName ?? 'Ben';

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const msg: Message = {
      id: generateId(),
      roomId,
      userId: currentUserId,
      content: trimmed,
      timestamp: nowIso(),
    };

    addMessage(msg);
    setText('');
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={roomMessages}
        keyExtractor={(m) => m.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isMe = item.userId === currentUserId || item.userId === 'my-user';
          const timeFormatted = new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <View style={[styles.bubbleWrap, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
              {!isMe && (
                <View style={[styles.avatarMini, { backgroundColor: colors.surfaceVariant }]}>
                  <Text style={[typography.overline, { color: colors.textSecondary }]}>
                    {item.userId.slice(0, 2).toUpperCase()}
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
            </View>
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
      <View style={[styles.inputRow, { backgroundColor: colors.surface, borderTopColor: colors.divider }]}>
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
    height: 280,
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
