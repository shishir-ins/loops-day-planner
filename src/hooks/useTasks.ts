import { useState, useEffect, useCallback } from "react";
import { supabase, supabaseConfigError } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Task = Tables<"tasks">;

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    const fetchTasks = async () => {
      if (!supabase) {
        console.warn(supabaseConfigError);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setTasks(data);
      setLoading(false);
    };
    fetchTasks();
  }, []);

  // Real-time subscription
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTasks((prev) => [payload.new as Task, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setTasks((prev) =>
              prev.map((t) => (t.id === (payload.new as Task).id ? (payload.new as Task) : t))
            );
          } else if (payload.eventType === "DELETE") {
            setTasks((prev) => prev.filter((t) => t.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const addTask = useCallback(async (text: string, deadline: string, note?: string) => {
    if (!supabase) return;
    await supabase.from("tasks").insert({ text, deadline, note: note || null });
  }, []);

  const toggleComplete = useCallback(async (id: string) => {
    if (!supabase) return;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    await supabase.from("tasks").update({ completed: !task.completed }).eq("id", id);
  }, [tasks]);

  const deleteTask = useCallback(async (id: string) => {
    if (!supabase) return;
    await supabase.from("tasks").delete().eq("id", id);
  }, []);

  const updateStopwatch = useCallback(async (id: string, seconds: number, running: boolean) => {
    if (!supabase) return;
    await supabase.from("tasks").update({ stopwatch_seconds: seconds, stopwatch_running: running }).eq("id", id);
  }, []);

  return { tasks, loading, addTask, toggleComplete, deleteTask, updateStopwatch };
};
