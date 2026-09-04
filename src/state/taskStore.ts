/**
 * Task store — task management state.
 *
 * Client-side state container for tasks. Persistence/sync with the backend is
 * added in M03 by wiring these actions to `TaskService`.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '../platform/storage';
import { toLocalDateStr } from '../utils/datetime';
import type { Task } from '../types';

export function getTasksForDate(allTasks: Task[], dateStr: string): Task[] {
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDateObj = new Date(year, month - 1, day);
  const dayOfWeek = targetDateObj.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  // 1. Concrete tasks specifically targeting dateStr
  const concreteTasks = allTasks.filter((t) => t.targetDate === dateStr);

  const todayStr = toLocalDateStr(new Date());
  // If the target date is in the past, only return historical concrete tasks (no virtual recurring tasks)
  if (dateStr < todayStr) {
    const uncompleted = concreteTasks.filter((t) => !t.completed);
    const completed = concreteTasks.filter((t) => t.completed);
    return [...uncompleted, ...completed];
  }

  // Set of signatures for concrete tasks on this date
  const concreteSignatures = new Set(concreteTasks.map((t) => `${t.title}-${t.tag || ''}`));

  // 2. Scan recurring tasks
  const recurringTemplates = new Map<string, Task>();
  allTasks.forEach((t) => {
    if (t.recurrence && t.recurrence.type && t.recurrence.type !== 'none') {
      const sig = `${t.title}-${t.tag || ''}`;
      // Keep latest template
      if (!recurringTemplates.has(sig) || (t.targetDate || '') > (recurringTemplates.get(sig)!.targetDate || '')) {
        recurringTemplates.set(sig, t);
      }
    }
  });

  const virtualTasks: Task[] = [];
  for (const t of recurringTemplates.values()) {
    const sig = `${t.title}-${t.tag || ''}`;
    // If a concrete task already exists for this date with this signature, don't duplicate
    if (concreteSignatures.has(sig)) continue;

    // Check if this date was explicitly skipped as an exception
    if (t.recurrenceExceptions && t.recurrenceExceptions.includes(dateStr)) {
      continue;
    }

    // Check if recurrence matches dayOfWeek
    const type = t.recurrence!.type;
    let matches = false;
    if (type === 'daily') {
      matches = true;
    } else if (type === 'weekdays' && dayOfWeek >= 1 && dayOfWeek <= 5) {
      matches = true;
    } else if (type === 'weekends' && (dayOfWeek === 0 || dayOfWeek === 6)) {
      matches = true;
    } else if (type === 'custom' && t.recurrence!.customDays?.includes(dayOfWeek)) {
      matches = true;
    }

    if (matches) {
      virtualTasks.push({
        ...t,
        id: `virtual-${t.id}-${dateStr}`,
        targetDate: dateStr,
        completed: false,
        pomodoroCount: 0,
        isVirtualRecurring: true,
        originalTaskId: t.id,
      });
    }
  }

  // Completed at the bottom
  const combined = [...concreteTasks, ...virtualTasks];
  const uncompleted = combined.filter((t) => !t.completed);
  const completed = combined.filter((t) => t.completed);
  return [...uncompleted, ...completed];
}

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, patch: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  toggleCompleted: (taskId: string) => void;
  moveTaskToEnd: (taskId: string) => void;
  addRecurrenceException: (taskId: string, dateStr: string) => void;
  removeRecurrenceException: (taskId: string, dateStr: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  generateRecurringTasks: () => void;
  reorderTasks: (newTasks: Task[]) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      isLoading: false,
      error: null,

      setTasks: (tasks) => set({ tasks }),

      addTask: (task) =>
        set((state) => {
          // If task has targetPomodoroCount undefined, ensure standard 1
          const normalizedTask: Task = {
            ...task,
            targetDate: task.targetDate || toLocalDateStr(),
            targetPomodoroCount: task.targetPomodoroCount || 1,
            pomodoroCount: task.pomodoroCount || 0,
          };
          // Insert before any completed tasks if present
          const firstCompletedIndex = state.tasks.findIndex((t) => t.completed);
          if (firstCompletedIndex === -1) {
            return { tasks: [...state.tasks, normalizedTask] };
          }
          const nextTasks = [...state.tasks];
          nextTasks.splice(firstCompletedIndex, 0, normalizedTask);
          return { tasks: nextTasks };
        }),

      updateTask: (taskId, patch) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, ...patch } : t,
          ),
        })),

      removeTask: (taskId) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) })),

      toggleCompleted: (taskId) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === taskId);
          if (!task) return state;
          const nextCompleted = !task.completed;
          const updatedTask = { ...task, completed: nextCompleted };
          const remaining = state.tasks.filter((t) => t.id !== taskId);

          if (nextCompleted) {
            // Move to the bottom of the list
            return { tasks: [...remaining, updatedTask] };
          } else {
            // Uncompleted: place at the end of uncompleted tasks, before completed tasks
            const firstCompletedIndex = remaining.findIndex((t) => t.completed);
            if (firstCompletedIndex === -1) {
              return { tasks: [...remaining, updatedTask] };
            }
            const nextTasks = [...remaining];
            nextTasks.splice(firstCompletedIndex, 0, updatedTask);
            return { tasks: nextTasks };
          }
        }),

      moveTaskToEnd: (taskId) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === taskId);
          if (!task) return state;
          const remaining = state.tasks.filter((t) => t.id !== taskId);
          return { tasks: [...remaining, task] };
        }),

      addRecurrenceException: (taskId, dateStr) =>
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id === taskId) {
              const current = t.recurrenceExceptions || [];
              if (!current.includes(dateStr)) {
                return { ...t, recurrenceExceptions: [...current, dateStr] };
              }
            }
            return t;
          }),
        })),

      removeRecurrenceException: (taskId, dateStr) =>
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id === taskId && t.recurrenceExceptions) {
              return {
                ...t,
                recurrenceExceptions: t.recurrenceExceptions.filter((d) => d !== dateStr),
              };
            }
            return t;
          }),
        })),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      reset: () => set({ tasks: [], isLoading: false, error: null }),

      generateRecurringTasks: () => set((state) => {
        const todayStr = toLocalDateStr();
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

        const newTasks: Task[] = [];
        const existingTargetDates = new Set(
          state.tasks.filter(t => t.targetDate === todayStr).map(t => t.title + '-' + (t.tag || ''))
        );

        const recurringTemplates = new Map<string, Task>();
        state.tasks.forEach(t => {
          if (t.recurrence && t.recurrence.type && t.recurrence.type !== 'none') {
            const sig = t.title + '-' + (t.tag || '');
            if (!recurringTemplates.has(sig) || (t.targetDate || '') > (recurringTemplates.get(sig)!.targetDate || '')) {
              recurringTemplates.set(sig, t);
            }
          }
        });

        for (const t of recurringTemplates.values()) {
          if (t.targetDate === todayStr) continue; // Already generated for today
          if (t.recurrenceExceptions && t.recurrenceExceptions.includes(todayStr)) continue; // Skipped for today

          let shouldGenerate = false;
          const type = t.recurrence!.type;
          if (type === 'daily') shouldGenerate = true;
          else if (type === 'weekdays' && dayOfWeek >= 1 && dayOfWeek <= 5) shouldGenerate = true;
          else if (type === 'weekends' && (dayOfWeek === 0 || dayOfWeek === 6)) shouldGenerate = true;
          else if (type === 'custom' && t.recurrence!.customDays?.includes(dayOfWeek)) shouldGenerate = true;

          const sig = t.title + '-' + (t.tag || '');
          if (shouldGenerate && !existingTargetDates.has(sig)) {
            newTasks.push({
              ...t,
              id: Math.random().toString(36).substring(7),
              completed: false,
              pomodoroCount: 0,
              targetDate: todayStr,
              createdAt: new Date().toISOString(),
            });
          }
        }

        if (newTasks.length > 0) {
          return { tasks: [...state.tasks, ...newTasks] };
        }
        return state;
      }),
      
      reorderTasks: (newTasks) => set((state) => {
        const newTaskIds = new Set(newTasks.map(t => t.id));
        const otherTasks = state.tasks.filter(t => !newTaskIds.has(t.id));
        return { tasks: [...newTasks, ...otherTasks] };
      }),
    }),
    {
      name: 'pomomate-tasks',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({ tasks: state.tasks }),
    }
  )
);

