import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTimerStore, useRoomStore } from '../../../state';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function PiPFloatingBar() {
  const remainingSeconds = useTimerStore((s) => s.remainingSeconds);
  const isRunning = useTimerStore((s) => s.isRunning);
  const mode = useTimerStore((s) => s.mode);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const currentRoom = useRoomStore((s) => s.currentRoom);

  const isBreak = mode === 'shortBreak' || mode === 'longBreak';
  const themeColor = isBreak ? '#10B981' : '#A855F7';
  const modeLabel = isBreak ? 'MOLA' : 'ODAK';

  const handleToggleTimer = () => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.bar, { borderColor: `${themeColor}40` }]}>
        {/* Left: Indicator & Time */}
        <View style={styles.leftGroup}>
          <View style={[styles.statusDot, { backgroundColor: themeColor }]} />
          <Text style={styles.timeText}>{formatTime(remainingSeconds)}</Text>
        </View>

        {/* Center: Mode Badge / Room info */}
        <View style={[styles.modeBadge, { backgroundColor: `${themeColor}20` }]}>
          <Text style={[styles.modeText, { color: themeColor }]}>
            {currentRoom ? currentRoom.name.slice(0, 10) : modeLabel}
          </Text>
        </View>

        {/* Right: Quick Action Control */}
        <Pressable
          style={[styles.actionBtn, { backgroundColor: themeColor }]}
          onPress={handleToggleTimer}
        >
          <Ionicons
            name={isRunning ? 'pause' : 'play'}
            size={18}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090E',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  bar: {
    width: '100%',
    height: 48,
    backgroundColor: 'rgba(15, 18, 28, 0.95)',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(168, 85, 247, 0.45)',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },
  modeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  modeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
