/**
 * Active room screen — modular feature layout.
 *
 * Features (Timer, Tasks, Chat, Media, Files) are independent components.
 * The "+" button lets future features be plugged in without touching this file.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Card } from '../../components/Card';
import { BottomSheet } from '../../components/BottomSheet';
import { ParticipantsBar } from './ParticipantsBar';
import { RoomTimer, RoomTasks, RoomChat, RoomMedia, RoomFiles } from './features';
import { useRoomStore, useTimerStore } from '../../../state';

/** Registry of toggleable room features. Add new entries here. */
interface RoomFeatureDef {
  id: string;
  label: string;
  icon: string;
}

const allFeatures: RoomFeatureDef[] = [
  { id: 'timer', label: 'Sayaç', icon: 'timer-outline' },
  { id: 'tasks', label: 'Görevler', icon: 'list-outline' },
  { id: 'chat', label: 'Sohbet', icon: 'chatbubbles-outline' },
  { id: 'media', label: 'Medya', icon: 'videocam-outline' },
  { id: 'files', label: 'Dosyalar', icon: 'document-outline' },
];

interface RoomActiveScreenProps {
  roomId: string;
  onLeave: () => void;
}

export function RoomActiveScreen({ roomId, onLeave }: RoomActiveScreenProps) {
  const [activeFeatures, setActiveFeatures] = useState<string[]>(['timer', 'chat', 'media']);
  const [showFeatureMenu, setShowFeatureMenu] = useState(false);
  const colors = useColors();
  const room = useRoomStore((s) => s.currentRoom);
  const members = useRoomStore((s) => s.members);
  const timer = useTimerStore();

  const participants = members.map((m) => ({
    userId: m.userId,
    displayName: m.userId.slice(0, 6),
    avatarUrl: undefined,
  }));

  const toggleFeature = (id: string) => {
    setActiveFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
        <Pressable onPress={onLeave}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.subtitle, { color: colors.textPrimary, flex: 1, marginLeft: spacing.sm }]} numberOfLines={1}>
          {room?.name ?? 'Çalışma Odası'}
        </Text>
        {/* "+" expand button */}
        <Pressable onPress={() => setShowFeatureMenu(true)} style={styles.addBtn}>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
        </Pressable>
      </View>

      {/* Participants */}
      <ParticipantsBar participants={participants} />

      {/* Feature panels */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeFeatures.includes('timer') && (
          <Card style={styles.featureCard}>
            <RoomTimer remainingSeconds={timer.remainingSeconds} mode={timer.mode} />
          </Card>
        )}

        {activeFeatures.includes('media') && (
          <Card style={styles.featureCard}>
            <RoomMedia />
          </Card>
        )}

        {activeFeatures.includes('tasks') && (
          <Card style={styles.featureCard}>
            <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
              Görevler
            </Text>
            <RoomTasks tasks={[]} />
          </Card>
        )}

        {activeFeatures.includes('files') && (
          <Card style={styles.featureCard}>
            <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
              Dosyalar
            </Text>
            <RoomFiles />
          </Card>
        )}

        {activeFeatures.includes('chat') && (
          <Card style={{ ...styles.featureCard, padding: 0, overflow: 'hidden' as const }}>
            <RoomChat roomId={roomId} />
          </Card>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      {/* Feature toggle sheet */}
      <BottomSheet visible={showFeatureMenu} onClose={() => setShowFeatureMenu(false)}>
        <Text style={[typography.subtitle, { color: colors.textPrimary, marginBottom: spacing.md }]}>
          Özellikler
        </Text>
        {allFeatures.map((f) => {
          const active = activeFeatures.includes(f.id);
          return (
            <Pressable
              key={f.id}
              onPress={() => toggleFeature(f.id)}
              style={[styles.featureToggleRow, { borderBottomColor: colors.divider }]}
            >
              <Ionicons name={f.icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.textPrimary} />
              <Text style={[typography.body, { color: colors.textPrimary, flex: 1, marginLeft: spacing.md }]}>
                {f.label}
              </Text>
              <Ionicons
                name={active ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={active ? colors.success : colors.textDisabled}
              />
            </Pressable>
          );
        })}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  addBtn: { padding: spacing.xs },
  content: { flex: 1, paddingHorizontal: spacing.md },
  featureCard: { marginTop: spacing.sm },
  featureToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
});
