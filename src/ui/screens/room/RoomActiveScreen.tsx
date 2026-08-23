import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { Card } from '../../components/Card';
import { BottomSheet } from '../../components/BottomSheet';
import { BackgroundEffect } from '../../animations/BackgroundEffect';
import { ParticipantsBar } from './ParticipantsBar';
import { RoomTimer, RoomTasks, RoomChat, RoomMedia, RoomFiles } from './features';
import { useRoomStore, useTimerStore, useSettingsStore } from '../../../state';

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
  const backgroundEffectId = useSettingsStore((s) => s.backgroundEffectId);

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
      <BackgroundEffect effectId={backgroundEffectId} />

      {/* Gradient Header */}
      <View style={styles.headerWrap}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.headerContent}>
          <Pressable onPress={onLeave} hitSlop={10} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textInverse} />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={[typography.h3, { color: colors.textInverse }]} numberOfLines={1}>
              {room?.name ?? 'Çalışma Odası'}
            </Text>
            <View style={styles.liveBadge}>
              <View style={[styles.liveDot, { backgroundColor: colors.error }]} />
              <Text style={[typography.overline, { color: colors.textInverse }]}>CANLI</Text>
            </View>
          </View>
          <Pressable onPress={() => setShowFeatureMenu(true)} style={styles.addBtn}>
            <Ionicons name="add-circle" size={32} color={colors.textInverse} />
          </Pressable>
        </View>
        
        {/* Participants */}
        <View style={styles.participantsWrap}>
          <ParticipantsBar participants={participants} />
        </View>
      </View>

      {/* Feature panels */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeFeatures.includes('timer') && (
          <Card variant="glass" style={styles.featureCard}>
            <RoomTimer remainingSeconds={timer.remainingSeconds} mode={timer.mode} />
          </Card>
        )}

        {activeFeatures.includes('media') && (
          <Card variant="glass" style={styles.featureCard}>
            <RoomMedia />
          </Card>
        )}

        {activeFeatures.includes('tasks') && (
          <Card variant="glass" style={styles.featureCard}>
            <Text style={[typography.captionBold, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
              Ortak Görevler
            </Text>
            <RoomTasks tasks={[]} />
          </Card>
        )}

        {activeFeatures.includes('files') && (
          <Card variant="glass" style={styles.featureCard}>
            <Text style={[typography.captionBold, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
              Dosyalar
            </Text>
            <RoomFiles />
          </Card>
        )}

        {activeFeatures.includes('chat') && (
          <Card variant="glass" style={{ ...styles.featureCard, padding: 0, overflow: 'hidden' as const }}>
            <RoomChat roomId={roomId} />
          </Card>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      {/* Feature toggle sheet */}
      <BottomSheet visible={showFeatureMenu} onClose={() => setShowFeatureMenu(false)}>
        <Text style={[typography.subtitle, { color: colors.textPrimary, marginBottom: spacing.md }]}>
          Oda Özellikleri
        </Text>
        {allFeatures.map((f) => {
          const active = activeFeatures.includes(f.id);
          return (
            <Pressable
              key={f.id}
              onPress={() => toggleFeature(f.id)}
              style={[styles.featureToggleRow, { borderBottomColor: colors.divider }]}
            >
              <View style={[styles.featureIconWrap, { backgroundColor: active ? `${colors.success}20` : colors.surfaceVariant }]}>
                <Ionicons name={f.icon as keyof typeof Ionicons.glyphMap} size={20} color={active ? colors.success : colors.textSecondary} />
              </View>
              <Text style={[typography.body, { color: colors.textPrimary, flex: 1, marginLeft: spacing.md }]}>
                {f.label}
              </Text>
              <Ionicons
                name={active ? 'checkmark-circle' : 'ellipse-outline'}
                size={28}
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
  headerWrap: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  backBtn: { padding: spacing.xs },
  headerTitleWrap: { flex: 1, alignItems: 'center' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginTop: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  addBtn: { padding: spacing.xs, opacity: 0.9 },
  participantsWrap: { marginTop: spacing.lg },
  content: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.md },
  featureCard: { marginTop: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  featureToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
