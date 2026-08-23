import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTimerStore, useSettingsStore, useStatsStore, useTaskStore } from '../../../state';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { IconButton } from '../../components/IconButton';
import { Button } from '../../components/Button';
import { TimerFace } from './TimerFace';
import { BackgroundEffect } from '../../animations';
import { AdPlacement } from '../../ads';
import { notificationService } from '../../../services/mobile';
import type { TimerMode, Task } from '../../../types';
import { generateId } from '../../../utils/id';
import { nowIso } from '../../../utils/datetime';
import { AddTaskSheet } from '../tasks/AddTaskSheet';
import { TaskItem } from '../tasks/TaskItem';

const modeLabels: Record<TimerMode, string> = {
  work: 'Çalışma',
  shortBreak: 'Kısa Mola',
  longBreak: 'Uzun Mola',
};

export function TimerScreen() {
  const {
    remainingSeconds,
    duration,
    isRunning,
    mode,
    currentCycle,
    start,
    pause,
    reset,
    tick,
    next,
    setMode,
  } = useTimerStore();

  const timerDesignId = useSettingsStore((s) => s.timerDesignId);
  const backgroundEffectId = useSettingsStore((s) => s.backgroundEffectId);
  const recordPomodoro = useStatsStore((s) => s.recordPomodoro);
  const workDuration = useSettingsStore((s) => s.workDuration);
  const colors = useColors();
  
  // Task state
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const toggleCompleted = useTaskStore((s) => s.toggleCompleted);
  const removeTask = useTaskStore((s) => s.removeTask);
  const recordTaskCompleted = useStatsStore((s) => s.recordTaskCompleted);

  // Tick interval
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => tick(), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  // When timer hits 0, auto-advance and notify
  useEffect(() => {
    if (remainingSeconds === 0 && !isRunning) {
      if (mode === 'work') {
        recordPomodoro(workDuration);
        notificationService.scheduleTimerComplete(
          'Pomodoro Tamamlandı! 🍅',
          'Mola zamanı. İyi dinlenmeler!',
        );
      } else {
        notificationService.scheduleTimerComplete(
          'Mola Bitti! ⏰',
          'Çalışmaya geri dön.',
        );
      }
    }
  }, [remainingSeconds, isRunning, mode, recordPomodoro, workDuration]);

  const [showAddTask, setShowAddTask] = React.useState(false);

  const handleAddTask = useCallback(
    (title: string, tag: string | null, recurrence: any) => {
      const task: Task = {
        id: generateId(),
        userId: '',
        title,
        tag,
        recurrence: { type: recurrence },
        targetDate: new Date().toISOString().split('T')[0],
        completed: false,
        pomodoroCount: 0,
        createdAt: nowIso(),
      };
      addTask(task);
    },
    [addTask]
  );

  const handleToggleTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (task && !task.completed) {
        recordTaskCompleted();
      }
      toggleCompleted(id);
    },
    [tasks, toggleCompleted, recordTaskCompleted]
  );

  const modeButtons: TimerMode[] = ['work', 'shortBreak', 'longBreak'];

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => !t.targetDate || t.targetDate === todayStr);

  return (
    <BackgroundEffect effectId={backgroundEffectId}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Mode selector */}
        <View style={styles.modeRow}>
          {modeButtons.map((m) => (
            <Button
              key={m}
              title={modeLabels[m]}
              variant={mode === m ? 'primary' : 'ghost'}
              size="sm"
              onPress={() => setMode(m)}
              style={styles.modeBtn}
            />
          ))}
        </View>

        {/* Timer face */}
        <View style={styles.timerWrap}>
          <TimerFace
            designId={timerDesignId}
            remainingSeconds={remainingSeconds}
            duration={duration}
            mode={mode}
            isRunning={isRunning}
          />
        </View>

        {/* Cycle indicator */}
        <View style={[styles.cycleIndicator, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
            DÖNGÜ {currentCycle}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <IconButton
            icon={<Ionicons name="refresh" size={24} color={colors.textSecondary} />}
            onPress={reset}
          />
          <IconButton
            icon={
              <Ionicons
                name={isRunning ? 'pause' : 'play'}
                size={36}
                color={colors.textInverse}
              />
            }
            onPress={isRunning ? pause : start}
            size={72}
            style={{ backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8 }}
          />
          <IconButton
            icon={<Ionicons name="play-skip-forward" size={24} color={colors.textSecondary} />}
            onPress={next}
          />
        </View>

        {/* Tasks Section */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksHeader}>
            <Text style={[typography.h3, { color: colors.textPrimary }]}>📋 Görevlerim</Text>
            <View style={[styles.taskCountBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[typography.captionBold, { color: colors.textInverse }]}>
                {todayTasks.filter(t => !t.completed).length}
              </Text>
            </View>
            <View style={{ flex: 1 }} />
            <Button 
              title="Yeni Ekle" 
              size="sm" 
              variant="outline" 
              icon={<Ionicons name="add" size={16} color={colors.primary} />}
              onPress={() => setShowAddTask(true)}
            />
          </View>
          
          <View style={styles.taskList}>
            {todayTasks.length === 0 ? (
              <View style={styles.emptyTasks}>
                <Text style={[typography.body, { color: colors.textDisabled, textAlign: 'center' }]}>
                  Şu an için hiç göreviniz yok. Yeni bir görev ekleyerek çalışmaya başlayın.
                </Text>
              </View>
            ) : (
              todayTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onDelete={removeTask}
                />
              ))
            )}
          </View>
        </View>

        {/* Ad banner — below controls, never over timer */}
        <AdPlacement size="banner" />
      </ScrollView>

      <AddTaskSheet 
        visible={showAddTask}
        onClose={() => setShowAddTask(false)}
        onAdd={handleAddTask}
      />
    </BackgroundEffect>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  modeRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    gap: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 4,
    borderRadius: 20,
  },
  modeBtn: { minWidth: 80, borderRadius: 16 },
  timerWrap: {
    marginVertical: spacing.lg,
    alignItems: 'center',
  },
  cycleIndicator: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxl,
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
  tasksSection: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
  },
  tasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  taskCountBadge: {
    marginLeft: spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  taskList: {
    marginTop: spacing.sm,
  },
  emptyTasks: {
    padding: spacing.xl,
    alignItems: 'center',
  }
});
