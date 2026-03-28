import { useCallback, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Lock, Plus, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import FloatingLeaves from "@/components/FloatingLeaves";
import PixelCharacters from "@/components/PixelCharacters";
import LoveMessages from "@/components/LoveMessages";
import DateTimeClock from "@/components/DateTimeClock";
import PwaInstallCard from "@/components/PwaInstallCard";
import TaskItem from "@/components/TaskItem";
import TaskInput from "@/components/TaskInput";
import SurpriseMessage from "@/components/SurpriseMessage";
import { useTasks } from "@/hooks/useTasks";
import { useNotifications } from "@/hooks/useNotifications";
import { supabaseConfigError } from "@/integrations/supabase/client";

const LOOPS_PASSCODE = "iloveyou";

const Index = () => {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem("loops-unlocked") === "true");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);
  const { tasks, loading, toggleComplete, deleteTask, updateStopwatch, addTask } = useTasks();
  const { notifyNewTask, notifyDeadline, notificationsSupported, permission, requestPermission } = useNotifications();
  const notifiedRef = useRef<Set<string>>(new Set());
  const prevTaskIdsRef = useRef<Set<string>>(new Set());

  // Notify on new tasks from admin
  useEffect(() => {
    if (!unlocked) return;
    const currentIds = new Set(tasks.map((t) => t.id));
    tasks.forEach((t) => {
      if (!prevTaskIdsRef.current.has(t.id) && prevTaskIdsRef.current.size > 0) {
        notifyNewTask(t.text);
      }
    });
    prevTaskIdsRef.current = currentIds;
  }, [tasks, unlocked, notifyNewTask]);

  const handleDeadlineClose = useCallback(
    (name: string) => {
      if (!notifiedRef.current.has(name)) {
        notifiedRef.current.add(name);
        notifyDeadline(name);
      }
    },
    [notifyDeadline]
  );

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.toLowerCase() === LOOPS_PASSCODE) {
      setUnlocked(true);
      localStorage.setItem("loops-unlocked", "true");
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
            <div className="animate-pulse-heart inline-block">
              <Heart className="w-12 h-12 text-love fill-love/30 mx-auto" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">Loop's Day! 💕</h1>
            <p className="text-sm text-muted-foreground font-body">Enter your secret passcode</p>
            <form onSubmit={handleUnlock} className="space-y-3">
              <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-4 py-3">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="passcode..."
                  className="flex-1 bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                />
              </div>
              {error && <p className="text-xs text-destructive">Wrong passcode, try again 💕</p>}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full bg-primary text-primary-foreground rounded-xl px-4 py-3 font-display font-semibold text-sm shadow-md"
              >
                Enter 🌸
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
      <PixelCharacters />
      <SurpriseMessage />

      <div className="relative z-10 flex flex-col items-center px-4 py-8 sm:py-12 max-w-lg mx-auto min-h-screen">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-6">
          <motion.div className="animate-pulse-heart inline-block mb-3">
            <Heart className="w-10 h-10 text-love fill-love/30 mx-auto" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">Loop's Day!</h1>
          <p className="text-base font-display text-muted-foreground mt-1">Welcome, loops! 💕</p>
          <div className="mt-3"><LoveMessages /></div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass rounded-2xl px-6 py-4 mb-6 w-full">
          <DateTimeClock />
        </motion.div>

        <PwaInstallCard
          notificationsSupported={notificationsSupported}
          permission={permission}
          requestPermission={requestPermission}
        />

        {supabaseConfigError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Live task sync is not configured in this deployment yet. The planner UI can still open, but GitHub needs the Supabase secrets before tasks will load online.
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full mb-6">
          <TaskInput onAdd={addTask} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full mb-6">
          <Link
            to="/planner"
            className="glass-strong rounded-2xl p-4 flex items-center justify-center gap-3 text-primary hover:bg-primary/10 transition-all duration-300 group"
          >
            <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-display font-semibold">Open Daily Planner 🌿</span>
          </Link>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-display animate-pulse">Loading your tasks... 🍃</p>
          </div>
        ) : (
          <div className="w-full space-y-3 pb-20">
            {activeTasks.length > 0 && (
              <p className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-widest px-1">✨ To Do — {activeTasks.length}</p>
            )}
            <AnimatePresence>
              {activeTasks.map((task) => (
                <TaskItem key={task.id} task={task} onToggle={toggleComplete} onDelete={deleteTask}
                  onUpdateStopwatch={updateStopwatch} onDeadlineClose={handleDeadlineClose} />
              ))}
            </AnimatePresence>

            {completedTasks.length > 0 && (
              <>
                <p className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-widest px-1 pt-4">🎉 Done — {completedTasks.length}</p>
                <AnimatePresence>
                  {completedTasks.map((task) => (
                    <TaskItem key={task.id} task={task} onToggle={toggleComplete} onDelete={deleteTask}
                      onUpdateStopwatch={updateStopwatch} onDeadlineClose={handleDeadlineClose} />
                  ))}
                </AnimatePresence>
              </>
            )}

            {tasks.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <p className="text-5xl mb-3">🌿</p>
                <p className="font-display text-muted-foreground text-sm">No tasks yet! Add your first task or wait for your love to add some 💕</p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
