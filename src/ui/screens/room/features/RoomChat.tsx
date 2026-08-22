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
import { Avatar } from '../../../components/Avatar';
import { generateId } from '../../../../utils/id';
import { nowIso } from '../../../../utils/datetime';
import type { Message } from '../../../../types';

interface RoomChatProps {
  roomId: string;
}

export function RoomChat({ roomId }: RoomChatProps) {
  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const user = useUserStore((s) => s.user);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList<Message>>(null);
  const colors = useColors();

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !user) return;
    const msg: Message = {
      id: generateId(),
      roomId,
      userId: user.id,
      content: trimmed,
      timestamp: nowIso(),
    };
    addMessage(msg);
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        style={styles.list}
        renderItem={({ item }) => {
          const isMe = item.userId === user?.id;
          return (
            <View style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
              {!isMe && <Avatar name="?" size={24} />}
              <View
                style={[
                  styles.msgBox,
                  { backgroundColor: isMe ? colors.primary : colors.surfaceVariant },
                ]}
              >
                <Text style={[typography.body, { color: isMe ? colors.textInverse : colors.textPrimary }]}>
                  {item.content}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={[typography.caption, { color: colors.textDisabled }]}>
              Henüz mesaj yok
            </Text>
          </View>
        }
      />

      {/* Input bar */}
      <View style={[styles.inputRow, { backgroundColor: colors.surface, borderTopColor: colors.divider }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Mesaj yaz…"
          placeholderTextColor={colors.textDisabled}
          onSubmitEditing={handleSend}
          style={[typography.body, styles.input, { color: colors.textPrimary, backgroundColor: colors.surfaceVariant }]}
        />
        <Pressable onPress={handleSend} style={[styles.sendBtn, { backgroundColor: colors.primary }]}>
          <Ionicons name="send" size={18} color={colors.textInverse} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, maxHeight: 360 },
  list: { flex: 1, paddingHorizontal: spacing.sm },
  bubble: { flexDirection: 'row', marginVertical: spacing.xxs, alignItems: 'flex-end' },
  bubbleLeft: { justifyContent: 'flex-start' },
  bubbleRight: { justifyContent: 'flex-end' },
  msgBox: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, maxWidth: '75%', marginHorizontal: spacing.xs },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, borderTopWidth: 1 },
  input: { flex: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginRight: spacing.sm },
  sendBtn: { width: 36, height: 36, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
});
