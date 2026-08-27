import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTimerStore, useSettingsStore, useStatsStore, useTaskStore } from '../../../state';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { IconButton } from '../../components/IconButton';
import { Button } from '../../components/Button';
import { TimerFace } from './TimerFace';
import { BackgroundEffect, FocusAnimation } from '../../animations';
import { AdPlacement } from '../../ads';
import { notificationService } from '../../../services/mobile';
import { soundService } from '../../../services/mobile/sound/SoundService';
import { adMobService } from '../../../services/monetization';
import type { TimerMode, Task } from '../../../types';
import { generateId } from '../../../utils/id';
import { nowIso } from '../../../utils/datetime';
import { AddTaskSheet } from '../tasks/AddTaskSheet';
import { TaskItem } from '../tasks/TaskItem';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  const workAnimationId = useSettingsStore((s) => s.workAnimationId);
  const breakAnimationId = useSettingsStore((s) => s.breakAnimationId);
  const activeAnimationId = mode === 'work' ? workAnimationId : breakAnimationId;
  const recordPomodoro = useStatsStore((s) => s.recordPomodoro);
  const workDuration = useSettingsStore((s) => s.workDuration);
  const colors = useColors();
  
  // Task state
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const toggleCompleted = useTaskStore((s) => s.toggleCompleted);
  const removeTask = useTaskStore((s) => s.removeTask);
  const recordTaskCompleted = useStatsStore((s) => s.recordTaskCompleted);

  // Expandable task list
  const [isTaskListExpanded, setIsTaskListExpanded] = useState(false);
  const chevronAnim = useRef(new Animated.Value(0)).current;

  const toggleTaskList = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsTaskListExpanded(!isTaskListExpanded);
    Animated.timing(chevronAnim, {
      toValue: isTaskListExpanded ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const chevronRotation = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

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

  // Sync ambient background sound (rain, campfire, birds) with timer
  useEffect(() => {
    soundService.syncAmbientWithTimer(isRunning, mode);
    return () => {
      soundService.stopAmbient();
    };
  }, [isRunning, mode]);

  // When timer hits 0, auto-advance and notify
  useEffect(() => {
    if (remainingSeconds === 0 && !isRunning) {
      if (mode === 'work') {
        recordPomodoro(workDuration);
        
        // Find the first uncompleted task for today and increment its pomodoroCount
        const todayStr = new Date().toISOString().split('T')[0];
        const activeTask = useTaskStore.getState().tasks.find(t => 
          (!t.targetDate || t.targetDate === todayStr) && !t.completed
        );
        if (activeTask) {
          useTaskStore.getState().updateTask(activeTask.id, { 
            pomodoroCount: (activeTask.pomodoroCount || 0) + 1 
          });
        }
        
        soundService.playCompletionSound();
        notificationService.scheduleTimerComplete(
          'Pomodoro Tamamlandı! 🍅',
          'Mola zamanı. İyi dinlenmeler!',
        );

        // Show interstitial ad for free users
        const isPremium = useSettingsStore.getState().isPremium;
        if (!isPremium) {
          adMobService.showInterstitial();
        }
      } else {
        soundService.playCompletionSound();
        notificationService.scheduleTimerComplete(
          'Mola Bitti! ⏰',
          'Çalışmaya geri dön.',
        );
      }
    }
  }, [remainingSeconds, isRunning, mode, recordPomodoro, workDuration]);

  const [showAddTask, setShowAddTask] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | undefined>(undefined);

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
  
  const handleEditTask = useCallback((id: string, updates: Partial<Task>) => {
    useTaskStore.getState().updateTask(id, updates);
  }, []);

  const openEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setShowAddTask(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setShowAddTask(false);
    setTimeout(() => setEditingTask(undefined), 300);
  }, []);

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
  const uncompletedTasks = todayTasks.filter(t => !t.completed);
  const activeTask = uncompletedTasks[0];
  const remainingTaskList = todayTasks.slice(1); // all tasks except the first one

  return (
    <BackgroundEffect effectId={backgroundEffectId}>
      {/* 
        Tam Ekran Animasyon Katmanı (İleride tam ekran video/animasyon eklenirse en arkada çalışır)
        pointerEvents="none" sayesinde tıklamalar içeriğe geçer.
      */}
      <View style={[StyleSheet.absoluteFill, { zIndex: -1 }]} pointerEvents="none">
         {/* Tam ekran arka plan animasyonları buraya */}
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* 1. ÜST BÖLÜM: Mod Seçici, Sayaç ve Döngü */}
        <View style={styles.topSection}>
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
          <View style={[styles.cycleIndicator, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
            <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
              DÖNGÜ {currentCycle}
            </Text>
          </View>
        </View>

        {/* 2. ORTA BÖLÜM: 1x1 Animasyon Alanı (Pomocat tarzı boşluk) */}
        <View style={styles.middleAnimationSection}>
          <View style={styles.animationContainer1x1}>
            <FocusAnimation animationId={activeAnimationId} size={220} />
          </View>
        </View>

        {/* 3. ALT BÖLÜM: Butonlar ve Görevler */}
        <View style={styles.bottomSection}>
          {/* Controls */}
          <View style={styles.controls}>
            <IconButton
              icon={<Ionicons name="refresh" size={22} color={colors.textSecondary} />}
              onPress={reset}
              size={48}
            />
            <IconButton
              icon={
                <Ionicons
                  name={isRunning ? 'pause' : 'play'}
                  size={32}
                  color={colors.textInverse}
                />
              }
              onPress={isRunning ? pause : start}
              size={64}
              style={{ backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8 }}
            />
            <IconButton
              icon={<Ionicons name="play-skip-forward" size={22} color={colors.textSecondary} />}
              onPress={next}
              size={48}
            />
          </View>

          {/* Tasks Section */}
          <View style={styles.tasksSection}>
            {/* Header */}
            <View style={styles.tasksHeader}>
              <Text style={[typography.h4, { color: colors.textPrimary }]}>📋 Görevlerim</Text>
              <View style={[styles.taskCountBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[typography.captionBold, { color: colors.textInverse, fontSize: 10 }]}>
                  {uncompletedTasks.length}
                </Text>
              </View>
              <View style={{ flex: 1 }} />
              <Button 
                title="Yeni" 
                size="sm" 
                variant="outline" 
                icon={<Ionicons name="add" size={14} color={colors.primary} />}
                onPress={() => { setEditingTask(undefined); setShowAddTask(true); }}
                style={{ minHeight: 32, paddingHorizontal: 12 }}
              />
            </View>
            
            {/* Active / Primary Task Card */}
            {todayTasks.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }]}>
                <Ionicons name="clipboard-outline" size={24} color={colors.textDisabled} />
                <Text style={[typography.caption, { color: colors.textDisabled, textAlign: 'center', marginTop: spacing.xs }]}>
                  Henüz görev eklenmedi.
                </Text>
              </View>
            ) : (
              <>
                {/* First (active) task */}
                <View style={[
                  styles.activeTaskCard,
                  { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: isRunning && mode === 'work' ? colors.primary : 'rgba(255,255,255,0.1)' }
                ]}>
                  {isRunning && mode === 'work' && (
                    <View style={[styles.workingIndicator, { backgroundColor: colors.primary }]}>
                      <Ionicons name="radio" size={8} color={colors.textInverse} />
                      <Text style={[typography.overline, { color: colors.textInverse, marginLeft: 3, fontSize: 8 }]}>ÜZERİNDE ÇALIŞILIYOR</Text>
                    </View>
                  )}
                  <View style={{ transform: [{ scale: 0.95 }] }}>
                    <TaskItem
                      task={todayTasks[0]}
                      onToggle={handleToggleTask}
                      onDelete={removeTask}
                      onPress={openEditTask}
                    />
                  </View>
                </View>

                {/* Expand/Collapse button */}
                {remainingTaskList.length > 0 && (
                  <Pressable 
                    onPress={toggleTaskList} 
                    style={[styles.expandBtn, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                  >
                    <Text style={[typography.captionBold, { color: colors.textSecondary, fontSize: 11 }]}>
                      {isTaskListExpanded ? 'Görevleri Gizle' : `+${remainingTaskList.length} görev daha`}
                    </Text>
                    <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
                      <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
                    </Animated.View>
                  </Pressable>
                )}

                {/* Expanded task list */}
                {isTaskListExpanded && (
                  <View style={[styles.expandedList, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }]}>
                    {remainingTaskList.map((task) => (
                      <View key={task.id} style={{ transform: [{ scale: 0.95 }] }}>
                        <TaskItem
                          task={task}
                          onToggle={handleToggleTask}
                          onDelete={removeTask}
                          onPress={openEditTask}
                        />
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Ad banner */}
        <AdPlacement size="banner" />
      </ScrollView>

      <AddTaskSheet 
        visible={showAddTask}
        onClose={handleCloseSheet}
        onAdd={handleAddTask}
        onEdit={handleEditTask}
        initialTask={editingTask}
      />
    </BackgroundEffect>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  topSection: {
    width: '100%',
    alignItems: 'center',
  },
  modeRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 4,
    borderRadius: 20,
  },
  modeBtn: { minWidth: 76, borderRadius: 16 },
  timerWrap: {
    marginVertical: spacing.xs,
    alignItems: 'center',
    width: '100%',
    transform: [{ scale: 0.82 }], // Sayacı kompakt tutuyoruz
  },
  cycleIndicator: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
  },
  middleAnimationSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    marginVertical: spacing.xs,
  },
  animationContainer1x1: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.md,
    width: '100%',
  },
  tasksSection: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  tasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  taskCountBadge: {
    marginLeft: spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  activeTaskCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  workingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  expandedList: {
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
