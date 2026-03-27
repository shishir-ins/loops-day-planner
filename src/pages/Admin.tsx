import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Lock, Shield } from "lucide-react";
import FloatingLeaves from "@/components/FloatingLeaves";
import DateTimeClock from "@/components/DateTimeClock";
import TaskInput from "@/components/TaskInput";
import TaskItem from "@/components/TaskItem";
import { useTasks } from "@/hooks/useTasks";
import { useNotifications } from "@/hooks/useNotifications";
import { supabaseConfigError } from "@/integrations/supabase/client";

const ADMIN_PASSCODE = "loopsadmin";

const Admin = () => {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem("loops-admin") === "true");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);
  const { tasks, loading, addTask, toggleComplete, deleteTask, updateStopwatch } = useTasks();
  const { notifyNewTask } = useNotifications();

  const handleAddTask = useCallback(async (text: string, deadline: string, note?: string) => {
    await addTask(text, deadline, note);
    notifyNewTask(text, true);
  }, [addTask, notifyNewTask]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.toLowerCase() === ADMIN_PASSCODE) {
      setUnlocked(true);
      localStorage.setItem("loops-admin", "true");
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  if (!unlocked) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <FloatingLeaves />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-3xl p-8 max-w-sm w-full text-center space-y-5"
          >
            <Shield className="w-12 h-12 text-primary mx-auto" />
            <h1 className="text-2xl font-display font-bold text-foreground">Admin Access 🔐</h1>
            <p className="text-sm text-muted-foreground font-body">Enter admin passcode</p>
            <form onSubmit={handleUnlock} className="space-y-3">
              <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-4 py-3">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)}
                  placeholder="admin passcode..."
                  className="flex-1 bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none" />
              </div>
              {error && <p className="text-xs text-destructive">Wrong passcode 🙅</p>}
              <motion.button type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="w-full bg-primary text-primary-foreground rounded-xl px-4 py-3 font-display font-semibold text-sm shadow-md">
                Enter Admin 🛡️
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FloatingLeaves />
      <div className="relative z-10 flex flex-col items-center px-4 py-8 sm:py-12 max-w-lg mx-auto min-h-screen">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <Heart className="w-10 h-10 text-love fill-love/30 mx-auto mb-2" />
          <h1 className="text-3xl font-display font-bold text-foreground">Admin Panel 🛡️</h1>
          <p className="text-sm text-muted-foreground font-display mt-1">Add tasks for loops 💕</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass rounded-2xl px-6 py-4 mb-6 w-full">
          <DateTimeClock />
        </motion.div>

        {supabaseConfigError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This deployment is missing the Supabase secrets, so admin task changes will not sync online until GitHub Actions is configured.
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full mb-6">
          <TaskInput onAdd={handleAddTask} />
        </motion.div>

        {loading ? (
          <p className="text-muted-foreground font-display animate-pulse py-8">Loading... 🍃</p>
        ) : (
          <div className="w-full space-y-3 pb-20">
            {activeTasks.length > 0 && (
              <p className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-widest px-1">Active — {activeTasks.length}</p>
            )}
            <AnimatePresence>
              {activeTasks.map((task) => (
                <TaskItem key={task.id} task={task} onToggle={toggleComplete} onDelete={deleteTask}
                  onUpdateStopwatch={updateStopwatch} isAdmin />
              ))}
            </AnimatePresence>
            {completedTasks.length > 0 && (
              <>
                <p className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-widest px-1 pt-4">Completed — {completedTasks.length}</p>
                <AnimatePresence>
                  {completedTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onToggle={toggleComplete} onDelete={deleteTask}
                      onUpdateStopwatch={updateStopwatch} isAdmin />
                  ))}
                </AnimatePresence>
              </>
            )}
            {tasks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-muted-foreground font-display text-sm">No tasks yet. Add one above!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
