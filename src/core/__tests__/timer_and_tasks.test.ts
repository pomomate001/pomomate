import { describe, it, expect, beforeEach } from '@jest/globals';
import { useSettingsStore } from '../../state/settingsStore';
import { useTimerStore } from '../../state/timerStore';
import { useTaskStore } from '../../state/taskStore';
import { useStatsStore } from '../../state/statsStore';
import type { Task } from '../../types';

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
    const todayStr = new Date().toISOString().split('T')[0];

    // Record 5 minute pomodoro (300 seconds)
    useStatsStore.getState().recordPomodoro(300);

    const stats = useStatsStore.getState();
    expect(stats.totalPomodoros).toBe(1);
    expect(stats.totalWorkSeconds).toBe(300);

    const dailyToday = stats.daily.find((d) => d.date === todayStr);
    expect(dailyToday).toBeDefined();
    expect(dailyToday?.totalSeconds).toBe(300);
    expect(dailyToday?.pomodorosCompleted).toBe(1);
  });

  it('records task completion into totalTasksCompleted and today daily stats', () => {
    const todayStr = new Date().toISOString().split('T')[0];

    useStatsStore.getState().recordTaskCompleted();

    const stats = useStatsStore.getState();
    expect(stats.totalTasksCompleted).toBe(1);

    const dailyToday = stats.daily.find((d) => d.date === todayStr);
    expect(dailyToday).toBeDefined();
    expect(dailyToday?.tasksCompleted).toBe(1);
  });
});
