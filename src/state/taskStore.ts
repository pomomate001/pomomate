/**
 * Task store — task management state.
 *
 * Client-side state container for tasks. Persistence/sync with the backend is
 * added in M03 by wiring these actions to `TaskService`.
 */
import { create } from 'zustand';
import type { Task } from '../types';

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, patch: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  toggleCompleted: (taskId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  generateRecurringTasks: () => void;
  reorderTasks: (newTasks: Task[]) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),

  updateTask: (taskId, patch) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, ...patch } : t,
      ),
    })),

  removeTask: (taskId) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) })),

  toggleCompleted: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t,
      ),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ tasks: [], isLoading: false, error: null }),

  generateRecurringTasks: () => set((state) => {
    // Generate tasks for today based on recurring templates
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

    const newTasks: Task[] = [];
    const existingTargetDates = new Set(
      state.tasks.filter(t => t.targetDate === todayStr).map(t => t.title + '-' + t.tag)
    );

    // Find all recurring tasks from the past or ones that have a recurrence set
    // A more robust implementation would store "templates" separately, 
    // but for now, we scan all tasks that have recurrence defined.
    // To avoid duplicating across days endlessly, we look for unique recurring signatures.
    const recurringTemplates = new Map<string, Task>();
    state.tasks.forEach(t => {
      if (t.recurrence && t.recurrence.type !== 'none') {
        const sig = t.title + '-' + t.tag;
        // Keep the latest template if multiple exist
        if (!recurringTemplates.has(sig) || t.targetDate! > recurringTemplates.get(sig)!.targetDate!) {
          recurringTemplates.set(sig, t);
        }
      }
    });

    for (const t of recurringTemplates.values()) {
      if (t.targetDate === todayStr) continue; // Already generated for today

      let shouldGenerate = false;
      const type = t.recurrence!.type;
      if (type === 'daily') shouldGenerate = true;
      else if (type === 'weekdays' && dayOfWeek >= 1 && dayOfWeek <= 5) shouldGenerate = true;
      else if (type === 'weekends' && (dayOfWeek === 0 || dayOfWeek === 6)) shouldGenerate = true;
      else if (type === 'custom' && t.recurrence!.customDays?.includes(dayOfWeek)) shouldGenerate = true;

      const sig = t.title + '-' + t.tag;
      if (shouldGenerate && !existingTargetDates.has(sig)) {
        newTasks.push({
          ...t,
          id: Math.random().toString(36).substring(7), // Generate new ID
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
    // newTasks only contains a subset (e.g. today's uncompleted tasks).
    // We need to merge this back into the full tasks array preserving order.
    // An easy way is to remove all tasks that are in newTasks from state.tasks,
    // and then add newTasks back. Or just replace the matched tasks in place.
    const newTaskIds = new Set(newTasks.map(t => t.id));
    const otherTasks = state.tasks.filter(t => !newTaskIds.has(t.id));
    return { tasks: [...newTasks, ...otherTasks] }; // Put newTasks first
  }),
}));
