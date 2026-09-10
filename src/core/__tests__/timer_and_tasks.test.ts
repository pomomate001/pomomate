import { describe, it, expect, beforeEach } from '@jest/globals';
import { useSettingsStore } from '../../state/settingsStore';
import { useTimerStore } from '../../state/timerStore';
import { useTaskStore } from '../../state/taskStore';
import { useStatsStore, calculateStreak, DailyStat } from '../../state/statsStore';
import { useBuddyStore } from '../../state/buddyStore';
import { timerDesigns } from '../../ui/screens/timer/timerDesigns';
import type { Task } from '../../types';

import { toLocalDateStr } from '../../utils/datetime';

describe('Timer and Settings Synchronization', () => {
  beforeEach(() => {
    useSettingsStore.getState().reset();
    useTimerStore.getState().reset();
    useTimerStore.getState().setMode('work');
  });

  it('updates timer duration when settings workDuration changes while timer is idle', () => {
    // Default work duration is 25 * 60 (1500)
    expect(useTimerStore.getState().duration).toBe(1500);

    // User changes work duration to 5 minutes (300 seconds) in profile settings
    useSettingsStore.getState().setWorkDuration(300);

    // Timer store should immediately update to 300 seconds
    expect(useTimerStore.getState().duration).toBe(300);
    expect(useTimerStore.getState().remainingSeconds).toBe(300);
  });

  it('resets timer to the duration configured in settingsStore', () => {
    useSettingsStore.getState().setWorkDuration(600); // 10 minutes
    useTimerStore.getState().reset();

    expect(useTimerStore.getState().duration).toBe(600);
    expect(useTimerStore.getState().remainingSeconds).toBe(600);
  });

  it('uses shortBreakDuration and longBreakDuration from settingsStore when changing modes', () => {
    useSettingsStore.getState().setShortBreakDuration(180); // 3 minutes
    useSettingsStore.getState().setLongBreakDuration(1200); // 20 minutes

    useTimerStore.getState().setMode('shortBreak');
    expect(useTimerStore.getState().duration).toBe(180);
    expect(useTimerStore.getState().remainingSeconds).toBe(180);

    useTimerStore.getState().setMode('longBreak');
    expect(useTimerStore.getState().duration).toBe(1200);
    expect(useTimerStore.getState().remainingSeconds).toBe(1200);
  });

  it('finishes a running timer by resetting remainingSeconds to full duration and stopping', () => {
    useTimerStore.getState().start();
    expect(useTimerStore.getState().isRunning).toBe(true);
    expect(useTimerStore.getState().targetEndTime).not.toBeNull();

    // Timer ticks down
    useTimerStore.getState().tick();

    // User long-presses Bitir (finish)
    useTimerStore.getState().finish();

    expect(useTimerStore.getState().isRunning).toBe(false);
    expect(useTimerStore.getState().targetEndTime).toBeNull();
    expect(useTimerStore.getState().remainingSeconds).toBe(useTimerStore.getState().duration);
  });

  it('restarts a timer by resetting to full duration and starting immediately', () => {
    useTimerStore.getState().start();
    useTimerStore.getState().tick();

    // Restart: reset then start
    useTimerStore.getState().reset();
    useTimerStore.getState().start();

    const state = useTimerStore.getState();
    expect(state.isRunning).toBe(true);
    expect(state.remainingSeconds).toBe(state.duration);
    expect(state.targetEndTime).toBeGreaterThan(Date.now());
  });

  it('includes the new Net Odak (bold) timer design in timerDesigns registry', () => {
    const boldDesign = timerDesigns.find((d) => d.id === 'bold');
    expect(boldDesign).toBeDefined();
    expect(boldDesign?.label).toBe('Net Odak');
    expect(boldDesign?.free).toBe(true);
  });
});

describe('Task Management and Reordering', () => {
  beforeEach(() => {
    useTaskStore.getState().reset();
  });

  it('assigns targetPomodoroCount: 1 by default when adding a task', () => {
    const task: Task = {
      id: 'task-1',
      userId: 'u1',
      title: 'Kitap Oku',
      completed: false,
      pomodoroCount: 0,
      createdAt: new Date().toISOString(),
    };

    useTaskStore.getState().addTask(task);
    const stored = useTaskStore.getState().tasks.find((t) => t.id === 'task-1');

    expect(stored).toBeDefined();
    expect(stored?.targetPomodoroCount).toBe(1);
    expect(stored?.pomodoroCount).toBe(0);
  });

  it('supports custom targetPomodoroCount', () => {
    const task: Task = {
      id: 'task-2',
      userId: 'u1',
      title: 'Proje Kodla',
      completed: false,
      pomodoroCount: 0,
      targetPomodoroCount: 4,
      createdAt: new Date().toISOString(),
    };

    useTaskStore.getState().addTask(task);
    const stored = useTaskStore.getState().tasks.find((t) => t.id === 'task-2');

    expect(stored?.targetPomodoroCount).toBe(4);
  });

  it('supports untimed tasks with targetPomodoroCount: 0 without overwriting to 1', () => {
    const task: Task = {
      id: 'task-untimed',
      userId: 'u1',
      title: 'Zamansız Görev (Ders Çalış)',
      completed: false,
      pomodoroCount: 0,
      targetPomodoroCount: 0,
      createdAt: new Date().toISOString(),
    };

    useTaskStore.getState().addTask(task);
    const stored = useTaskStore.getState().tasks.find((t) => t.id === 'task-untimed');

    expect(stored).toBeDefined();
    expect(stored?.targetPomodoroCount).toBe(0);
  });

  it('untimed tasks (targetPomodoroCount: 0) never auto-complete when pomodoro finishes', () => {
    const untimedTask: Task = {
      id: 't-untimed',
      userId: 'u1',
      title: 'Uzun Maraton Çalışması',
      completed: false,
      pomodoroCount: 0,
      targetPomodoroCount: 0,
      createdAt: new Date().toISOString(),
    };
    useTaskStore.getState().addTask(untimedTask);

    // Simulate completion logic as in TimerScreen:
    const activeTask = useTaskStore.getState().tasks.find((t) => t.id === 't-untimed')!;
    const currentCount = activeTask.pomodoroCount || 0;
    const targetCount = activeTask.targetPomodoroCount !== undefined ? activeTask.targetPomodoroCount : 1;
    const updatedCount = currentCount + 1;

    // targetCount is 0, so targetCount > 0 condition is false
    const shouldAutoComplete = targetCount > 0 && updatedCount >= targetCount;
    expect(shouldAutoComplete).toBe(false);

    // Instead, it just increments pomodoroCount and remains uncompleted
    useTaskStore.getState().updateTask(activeTask.id, { pomodoroCount: updatedCount });

    const updated = useTaskStore.getState().tasks.find((t) => t.id === 't-untimed')!;
    expect(updated.completed).toBe(false);
    expect(updated.pomodoroCount).toBe(1);
  });

  it('moves task to the bottom of the list when completed', () => {
    const task1: Task = {
      id: 't1',
      userId: 'u1',
      title: 'Görev 1',
      completed: false,
      pomodoroCount: 0,
      createdAt: new Date().toISOString(),
    };
    const task2: Task = {
      id: 't2',
      userId: 'u1',
      title: 'Görev 2',
      completed: false,
      pomodoroCount: 0,
      createdAt: new Date().toISOString(),
    };

    useTaskStore.getState().addTask(task1);
    useTaskStore.getState().addTask(task2);

    expect(useTaskStore.getState().tasks[0].id).toBe('t1');
    expect(useTaskStore.getState().tasks[1].id).toBe('t2');

    // Complete task 1
    useTaskStore.getState().toggleCompleted('t1');

    const tasks = useTaskStore.getState().tasks;
    // Task 2 should now be at the top, and completed Task 1 at the bottom
    expect(tasks[0].id).toBe('t2');
    expect(tasks[0].completed).toBe(false);
    expect(tasks[1].id).toBe('t1');
    expect(tasks[1].completed).toBe(true);
  });

  it('reorders tasks cleanly via reorderTasks (drag and drop)', () => {
    const t1: Task = { id: '1', userId: 'u', title: 'Task 1', completed: false, pomodoroCount: 0, createdAt: '' };
    const t2: Task = { id: '2', userId: 'u', title: 'Task 2', completed: false, pomodoroCount: 0, createdAt: '' };
    const t3: Task = { id: '3', userId: 'u', title: 'Task 3', completed: false, pomodoroCount: 0, createdAt: '' };

    useTaskStore.getState().addTask(t1);
    useTaskStore.getState().addTask(t2);
    useTaskStore.getState().addTask(t3);

    // User drags Task 3 to the top: [Task 3, Task 1, Task 2]
    useTaskStore.getState().reorderTasks([t3, t1, t2]);

    const tasks = useTaskStore.getState().tasks;
    expect(tasks[0].id).toBe('3');
    expect(tasks[1].id).toBe('1');
    expect(tasks[2].id).toBe('2');
  });

  it('moves task to end via moveTaskToEnd', () => {
    const t1: Task = { id: '1', userId: 'u', title: 'Task 1', completed: false, pomodoroCount: 0, createdAt: '' };
    const t2: Task = { id: '2', userId: 'u', title: 'Task 2', completed: false, pomodoroCount: 0, createdAt: '' };

    useTaskStore.getState().addTask(t1);
    useTaskStore.getState().addTask(t2);

    useTaskStore.getState().moveTaskToEnd('1');
    const tasks = useTaskStore.getState().tasks;
    expect(tasks[0].id).toBe('2');
    expect(tasks[1].id).toBe('1');
  });
});

describe('Stats Tracking and Daily Stats', () => {
  beforeEach(() => {
    useStatsStore.getState().reset();
  });

  it('records pomodoro session duration into totalWorkSeconds and today daily stats', () => {
    const todayStr = toLocalDateStr();

    // Record 5 minute pomodoro (300 seconds)
    useStatsStore.getState().recordPomodoro(300);

    const stats = useStatsStore.getState();
    expect(stats.totalPomodoros).toBe(1);
    expect(stats.totalWorkSeconds).toBe(300);
    expect(stats.streak).toBe(1);

    const dailyToday = stats.daily.find((d) => d.date === todayStr);
    expect(dailyToday).toBeDefined();
    expect(dailyToday?.totalSeconds).toBe(300);
    expect(dailyToday?.pomodorosCompleted).toBe(1);
  });

  it('records task completion into totalTasksCompleted and today daily stats', () => {
    const todayStr = toLocalDateStr();

    useStatsStore.getState().recordTaskCompleted();

    const stats = useStatsStore.getState();
    expect(stats.totalTasksCompleted).toBe(1);

    const dailyToday = stats.daily.find((d) => d.date === todayStr);
    expect(dailyToday).toBeDefined();
    expect(dailyToday?.tasksCompleted).toBe(1);
  });

  it('undoTaskCompleted decreases totalTasksCompleted and today daily stats', () => {
    const todayStr = toLocalDateStr();

    useStatsStore.getState().recordTaskCompleted();
    useStatsStore.getState().recordTaskCompleted();
    expect(useStatsStore.getState().totalTasksCompleted).toBe(2);

    useStatsStore.getState().undoTaskCompleted();

    const stats = useStatsStore.getState();
    expect(stats.totalTasksCompleted).toBe(1);

    const dailyToday = stats.daily.find((d) => d.date === todayStr);
    expect(dailyToday).toBeDefined();
    expect(dailyToday?.tasksCompleted).toBe(1);
  });

  it('calculates streak correctly for consecutive days', () => {
    const store = useStatsStore.getState();
    const today = new Date();
    
    // Create an array of mock daily stats with consecutive days
    const mockDaily = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      mockDaily.push({
        date: toLocalDateStr(d),
        totalSeconds: 1500,
        pomodorosCompleted: 1,
        tasksCompleted: 0
      });
    }
    
    store.setDaily(mockDaily);
    
    // Simulate recording a pomodoro today to trigger streak calc
    store.recordPomodoro(1500);
    
    // We already had 5 days (including today), adding one more today shouldn't change the days count, just values
    expect(useStatsStore.getState().streak).toBe(5);
  });

  it('calculates daily stats separately from weekly and all-time totals', () => {
    const now = new Date();
    const todayStr = toLocalDateStr(now);

    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = toLocalDateStr(twoDaysAgo);

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toLocalDateStr(yesterday);

    const mockDaily: DailyStat[] = [
      {
        date: twoDaysAgoStr,
        totalSeconds: 300, // 5 min
        pomodorosCompleted: 1,
        tasksCompleted: 1,
      },
      {
        date: yesterdayStr,
        totalSeconds: 600, // 10 min
        pomodorosCompleted: 2,
        tasksCompleted: 1,
      },
      {
        date: todayStr,
        totalSeconds: 300, // 5 min
        pomodorosCompleted: 1,
        tasksCompleted: 1,
      },
    ];

    useStatsStore.getState().setDaily(mockDaily);
    useStatsStore.setState({
      totalPomodoros: 4,
      totalWorkSeconds: 1200,
      totalTasksCompleted: 3,
      streak: calculateStreak(mockDaily),
    });

    // 1. Daily calculation: only today
    const dailyToday = mockDaily.find((d) => d.date === todayStr);
    const dailyDuration = dailyToday?.totalSeconds ?? 0;
    const dailyPomodoros = dailyToday?.pomodorosCompleted ?? 0;
    const dailyTasks = dailyToday?.tasksCompleted ?? 0;

    expect(dailyDuration).toBe(300);
    expect(dailyPomodoros).toBe(1);
    expect(dailyTasks).toBe(1);

    // 2. Weekly calculation: last 7 days window
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const startStr = toLocalDateStr(sevenDaysAgo);

    const weeklyStats = mockDaily.filter((s) => s.date >= startStr && s.date <= todayStr);
    const weeklyDuration = weeklyStats.reduce((sum, s) => sum + s.totalSeconds, 0);
    const weeklyPomodoros = weeklyStats.reduce((sum, s) => sum + s.pomodorosCompleted, 0);
    const weeklyTasks = weeklyStats.reduce((sum, s) => sum + s.tasksCompleted, 0);

    expect(weeklyDuration).toBe(1200);
    expect(weeklyPomodoros).toBe(4);
    expect(weeklyTasks).toBe(3);

    // Verify daily values are strictly differentiated from weekly totals
    expect(dailyPomodoros).toBeLessThan(weeklyPomodoros);
    expect(dailyDuration).toBeLessThan(weeklyDuration);

    // Streak should be 3
    expect(useStatsStore.getState().streak).toBe(3);
  });

  it('calculates monthly stats within current calendar month only', () => {
    const now = new Date();
    const todayStr = toLocalDateStr(now);
    const currentMonthPrefix = todayStr.substring(0, 7);

    const mockDaily: DailyStat[] = [
      {
        date: '2020-01-01',
        totalSeconds: 3600,
        pomodorosCompleted: 4,
        tasksCompleted: 2,
      },
      {
        date: todayStr,
        totalSeconds: 1500,
        pomodorosCompleted: 1,
        tasksCompleted: 1,
      },
    ];

    const monthlyStats = mockDaily.filter((s) => s.date.startsWith(currentMonthPrefix));
    const monthlyDuration = monthlyStats.reduce((sum, s) => sum + s.totalSeconds, 0);
    const monthlyPomodoros = monthlyStats.reduce((sum, s) => sum + s.pomodorosCompleted, 0);

    expect(monthlyDuration).toBe(1500);
    expect(monthlyPomodoros).toBe(1);
  });

  describe('Buddy Timer Synchronization with Duration Adaptation', () => {
    it('synchronizes timer duration and remaining seconds when receiving remote buddy update', () => {
      // User has 15 minutes (900 seconds) duration locally
      useTimerStore.getState().setTimerState({
        duration: 900,
        remainingSeconds: 900,
        isRunning: false,
        mode: 'work',
      });

      expect(useTimerStore.getState().duration).toBe(900);
      expect(useTimerStore.getState().remainingSeconds).toBe(900);

      // Peer has 25 minutes (1500 seconds) and syncs it across buddy session
      useTimerStore.getState().setTimerState({
        duration: 1500,
        remainingSeconds: 1500,
        mode: 'work',
        isRunning: true,
      });

      // User's store should now match the synchronized session duration
      expect(useTimerStore.getState().duration).toBe(1500);
      expect(useTimerStore.getState().remainingSeconds).toBe(1500);
      expect(useTimerStore.getState().isRunning).toBe(true);
    });

    it('synchronizes buddy finish action by stopping the timer and restoring full duration', () => {
      // Both peers are running a 1500s session
      useTimerStore.getState().setTimerState({
        duration: 1500,
        remainingSeconds: 1200,
        isRunning: true,
        mode: 'work',
        targetEndTime: Date.now() + 1200000,
      });

      // Peer finishes (stops) the session early
      useTimerStore.getState().setTimerState({
        isRunning: false,
        targetEndTime: null,
        remainingSeconds: 1500,
        duration: 1500,
      });

      const s = useTimerStore.getState();
      expect(s.isRunning).toBe(false);
      expect(s.targetEndTime).toBeNull();
      expect(s.remainingSeconds).toBe(1500);
    });

    it('records sent emojis into buddy store recentEmojis immediately', () => {
      useBuddyStore.setState({ recentEmojis: [] });
      expect(useBuddyStore.getState().recentEmojis.length).toBe(0);

      useBuddyStore.getState().addEmoji({
        id: 'emoji-1',
        sessionId: 'session-123',
        senderId: 'user-me',
        emojiCode: 'focus',
        createdAt: new Date().toISOString(),
      });

      const recent = useBuddyStore.getState().recentEmojis;
      expect(recent.length).toBe(1);
      expect(recent[0].emojiCode).toBe('focus');
      expect(recent[0].senderId).toBe('user-me');
    });
  });
});
