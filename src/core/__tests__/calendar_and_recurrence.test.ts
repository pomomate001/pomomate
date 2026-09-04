import { describe, it, expect, beforeEach } from '@jest/globals';
import { useTaskStore, getTasksForDate } from '../../state/taskStore';
import { toLocalDateStr } from '../../utils/datetime';
import type { Task } from '../../types';

describe('Local Date Formatting and Timezone Isolation', () => {
  it('formats dates consistently as YYYY-MM-DD in local time', () => {
    const fixedDate = new Date(2026, 8, 3, 2, 30, 0); // Month 8 is September (0-indexed)
    expect(toLocalDateStr(fixedDate)).toBe('2026-09-03');
  });

  it('correctly pads month and day with leading zeros', () => {
    const d = new Date(2026, 0, 5); // January 5
    expect(toLocalDateStr(d)).toBe('2026-01-05');
  });
});

describe('Calendar Task Projection and Recurrence', () => {
  beforeEach(() => {
    useTaskStore.getState().reset();
  });

  it('reflects daily recurring tasks on future calendar days as uncompleted', () => {
    const dailyTask: Task = {
      id: 'daily-1',
      userId: 'u1',
      title: 'İngilizce Çalış',
      completed: false,
      pomodoroCount: 0,
      targetDate: '2026-09-03',
      recurrence: { type: 'daily' },
      createdAt: '2026-09-03T10:00:00Z',
    };
    useTaskStore.getState().addTask(dailyTask);

    const tasks = useTaskStore.getState().tasks;

    // Tomorrow: 2026-09-04
    const tomorrowTasks = getTasksForDate(tasks, '2026-09-04');
    expect(tomorrowTasks.length).toBe(1);
    expect(tomorrowTasks[0].title).toBe('İngilizce Çalış');
    expect(tomorrowTasks[0].completed).toBe(false);
    expect(tomorrowTasks[0].isVirtualRecurring).toBe(true);

    // 10 days later: 2026-09-13
    const futureTasks = getTasksForDate(tasks, '2026-09-13');
    expect(futureTasks.length).toBe(1);
    expect(futureTasks[0].title).toBe('İngilizce Çalış');
    expect(futureTasks[0].completed).toBe(false);
  });

  it('reflects weekdays recurring tasks only on Monday through Friday', () => {
    const weekdayTask: Task = {
      id: 'wk-1',
      userId: 'u1',
      title: 'Ofis Görevleri',
      completed: false,
      pomodoroCount: 0,
      targetDate: '2026-09-03', // Thursday
      recurrence: { type: 'weekdays' },
      createdAt: '2026-09-03T10:00:00Z',
    };
    useTaskStore.getState().addTask(weekdayTask);

    const tasks = useTaskStore.getState().tasks;

    // 2026-09-04 is Friday (weekday) -> Should appear
    const fridayTasks = getTasksForDate(tasks, '2026-09-04');
    expect(fridayTasks.some((t) => t.title === 'Ofis Görevleri')).toBe(true);

    // 2026-09-05 is Saturday (weekend) -> Should NOT appear
    const saturdayTasks = getTasksForDate(tasks, '2026-09-05');
    expect(saturdayTasks.some((t) => t.title === 'Ofis Görevleri')).toBe(false);

    // 2026-09-06 is Sunday (weekend) -> Should NOT appear
    const sundayTasks = getTasksForDate(tasks, '2026-09-06');
    expect(sundayTasks.some((t) => t.title === 'Ofis Görevleri')).toBe(false);

    // 2026-09-07 is Monday (weekday) -> Should appear
    const mondayTasks = getTasksForDate(tasks, '2026-09-07');
    expect(mondayTasks.some((t) => t.title === 'Ofis Görevleri')).toBe(true);
  });

  it('removes recurring tasks from future days when deleted or recurrence removed', () => {
    const task: Task = {
      id: 'rem-1',
      userId: 'u1',
      title: 'Kitap Oku',
      completed: false,
      pomodoroCount: 0,
      targetDate: '2026-09-03',
      recurrence: { type: 'daily' },
      createdAt: '2026-09-03T10:00:00Z',
    };
    useTaskStore.getState().addTask(task);

    // Verify it appears in future
    expect(getTasksForDate(useTaskStore.getState().tasks, '2026-09-10').length).toBe(1);

    // Delete the task
    useTaskStore.getState().removeTask('rem-1');

    // Should no longer appear on future days
    expect(getTasksForDate(useTaskStore.getState().tasks, '2026-09-10').length).toBe(0);
  });
});

describe('Recurrence Exceptions (Skip for a specific date)', () => {
  beforeEach(() => {
    useTaskStore.getState().reset();
  });

  it('skips a recurring task on a specific day without modifying general recurrence', () => {
    const dailyTask: Task = {
      id: 'daily-exc',
      userId: 'u1',
      title: 'Spor Yap',
      completed: false,
      pomodoroCount: 0,
      targetDate: '2026-09-03',
      recurrence: { type: 'daily' },
      createdAt: '2026-09-03T10:00:00Z',
    };
    useTaskStore.getState().addTask(dailyTask);

    // Add exception for 2026-09-05 (user taking a day off on Saturday)
    useTaskStore.getState().addRecurrenceException('daily-exc', '2026-09-05');

    const tasks = useTaskStore.getState().tasks;

    // 2026-09-04 (Friday): should be visible
    expect(getTasksForDate(tasks, '2026-09-04').length).toBe(1);

    // 2026-09-05 (Saturday): should be SKIPPED / NOT visible
    expect(getTasksForDate(tasks, '2026-09-05').length).toBe(0);

    // 2026-09-06 (Sunday): should be visible again
    expect(getTasksForDate(tasks, '2026-09-06').length).toBe(1);

    // Undoing the exception
    useTaskStore.getState().removeRecurrenceException('daily-exc', '2026-09-05');
    const updatedTasks = useTaskStore.getState().tasks;
    expect(getTasksForDate(updatedTasks, '2026-09-05').length).toBe(1);
  });
});

describe('Future Date Task Booking (Rezervasyon) and Home Screen Isolation', () => {
  beforeEach(() => {
    useTaskStore.getState().reset();
  });

  it('allows scheduling a task for a future date without showing on today home screen', () => {
    const todayStr = '2026-09-03';
    const futureDateStr = '2026-09-10';

    // User books a task for September 10th
    const futureTask: Task = {
      id: 'future-1',
      userId: 'u1',
      title: 'Diş Hekimi Randevusu',
      completed: false,
      pomodoroCount: 0,
      targetDate: futureDateStr,
      recurrence: { type: 'none' },
      createdAt: '2026-09-03T10:00:00Z',
    };
    useTaskStore.getState().addTask(futureTask);

    const tasks = useTaskStore.getState().tasks;

    // 1. In calendar for September 10th, the task appears
    const sep10Tasks = getTasksForDate(tasks, futureDateStr);
    expect(sep10Tasks.length).toBe(1);
    expect(sep10Tasks[0].title).toBe('Diş Hekimi Randevusu');

    // 2. On today home screen, the task is strictly excluded
    const todayTasks = tasks.filter((t) => t.targetDate === todayStr);
    expect(todayTasks.some((t) => t.id === 'future-1')).toBe(false);

    // 3. User can cancel/delete the scheduled future task
    useTaskStore.getState().removeTask('future-1');
    expect(getTasksForDate(useTaskStore.getState().tasks, futureDateStr).length).toBe(0);
  });

  it('ensures yesterday uncompleted one-off task does not stay on today home screen', () => {
    const todayStr = '2026-09-03';
    const yesterdayStr = '2026-09-02';

    // Uncompleted task from yesterday
    const yesterdayTask: Task = {
      id: 'yesterday-1',
      userId: 'u1',
      title: 'Dün Yapılmayan Görev',
      completed: false,
      pomodoroCount: 0,
      targetDate: yesterdayStr,
      recurrence: { type: 'none' },
      createdAt: '2026-09-02T10:00:00Z',
    };
    useTaskStore.getState().addTask(yesterdayTask);

    const tasks = useTaskStore.getState().tasks;

    // Today's home screen filter strictly excludes yesterday's task
    const todayTasks = tasks.filter((t) => t.targetDate === todayStr);
    expect(todayTasks.some((t) => t.id === 'yesterday-1')).toBe(false);

    // But it remains intact in the calendar for yesterday's historical date
    const pastTasks = getTasksForDate(tasks, yesterdayStr);
    expect(pastTasks.some((t) => t.id === 'yesterday-1')).toBe(true);
  });

  it('does NOT project virtual recurring tasks to past dates', () => {
    const todayStr = toLocalDateStr(new Date());
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2);
    const pastDateStr = toLocalDateStr(pastDate);

    const recurringTask: Task = {
      id: 'recur-test-1',
      userId: 'u1',
      title: 'Tekrarlanan Spor',
      completed: false,
      pomodoroCount: 0,
      targetDate: todayStr,
      recurrence: { type: 'daily' },
      createdAt: `${todayStr}T10:00:00Z`,
    };
    useTaskStore.getState().addTask(recurringTask);

    const tasks = useTaskStore.getState().tasks;

    // Past date should not receive virtual recurring task
    const pastTasks = getTasksForDate(tasks, pastDateStr);
    expect(pastTasks.length).toBe(0);

    // Future date should receive virtual recurring task
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    const futureDateStr = toLocalDateStr(futureDate);
    const futureTasks = getTasksForDate(tasks, futureDateStr);
    expect(futureTasks.length).toBe(1);
    expect(futureTasks[0].isVirtualRecurring).toBe(true);
  });
});
