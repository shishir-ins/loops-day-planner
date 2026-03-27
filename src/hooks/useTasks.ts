import { useState, useEffect, useCallback } from "react";
import { Task } from "@/types/task";

const STORAGE_KEY = "loops-day-tasks";

const loadTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback((text: string, deadline: string) => {
    const task: Task = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      deadline,
      createdAt: new Date().toISOString(),
      stopwatchSeconds: 0,
      stopwatchRunning: false,
    };
    setTasks((prev) => [task, ...prev]);
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleStopwatch = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, stopwatchRunning: !t.stopwatchRunning } : t
      )
    );
  }, []);

  const tickStopwatch = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id && t.stopwatchRunning
          ? { ...t, stopwatchSeconds: t.stopwatchSeconds + 1 }
          : t
      )
    );
  }, []);

  return { tasks, addTask, toggleComplete, deleteTask, toggleStopwatch, tickStopwatch };
};
