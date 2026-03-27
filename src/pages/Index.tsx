import { useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import FloatingLeaves from "@/components/FloatingLeaves";
import PixelCharacters from "@/components/PixelCharacters";
import LoveMessages from "@/components/LoveMessages";
import DateTimeClock from "@/components/DateTimeClock";
import TaskInput from "@/components/TaskInput";
import TaskItem from "@/components/TaskItem";
import SurpriseMessage from "@/components/SurpriseMessage";
import { useTasks } from "@/hooks/useTasks";
import { useNotifications } from "@/hooks/useNotifications";

const Index = () => {
  const { tasks, addTask, toggleComplete, deleteTask, toggleStopwatch, tickStopwatch } = useTasks();
  const { notifyDeadline } = useNotifications();
  const notifiedRef = useRef<Set<string>>(new Set());

  const handleDeadlineClose = useCallback(
    (name: string) => {
      if (!notifiedRef.current.has(name)) {
        notifiedRef.current.add(name);
        notifyDeadline(name);
      }
    },
    [notifyDeadline]
  );

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FloatingLeaves />
      <PixelCharacters />
      <SurpriseMessage />

      <div className="relative z-10 flex flex-col items-center px-4 py-8 sm:py-12 max-w-lg mx-auto min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
          <motion.div className="animate-pulse-heart inline-block mb-3">
            <Heart className="w-10 h-10 text-love fill-love/30 mx-auto" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
            Loop's Day!
          </h1>
          <p className="text-base font-display text-muted-foreground mt-1">
            Welcome, loops! 💕
          </p>
          <div className="mt-3">
            <LoveMessages />
          </div>
        </motion.div>

        {/* Clock */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl px-6 py-4 mb-6 w-full"
        >
          <DateTimeClock />
        </motion.div>

        {/* Task Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full mb-6"
        >
          <TaskInput onAdd={addTask} />
        </motion.div>

        {/* Tasks */}
        <div className="w-full space-y-3 pb-20">
          {activeTasks.length > 0 && (
            <p className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-widest px-1">
              ✨ To Do — {activeTasks.length}
            </p>
          )}
          <AnimatePresence>
            {activeTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleComplete}
                onDelete={deleteTask}
                onToggleStopwatch={toggleStopwatch}
                onTick={tickStopwatch}
                onDeadlineClose={handleDeadlineClose}
              />
            ))}
          </AnimatePresence>

          {completedTasks.length > 0 && (
            <>
              <p className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-widest px-1 pt-4">
                🎉 Done — {completedTasks.length}
              </p>
              <AnimatePresence>
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleComplete}
                    onDelete={deleteTask}
                    onToggleStopwatch={toggleStopwatch}
                    onTick={tickStopwatch}
                    onDeadlineClose={handleDeadlineClose}
                  />
                ))}
              </AnimatePresence>
            </>
          )}

          {tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-5xl mb-3">🌿</p>
              <p className="font-display text-muted-foreground text-sm">
                Your day is a blank canvas 🎨
              </p>
              <p className="font-display text-muted-foreground/60 text-xs mt-1">
                Add your first task above!
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
