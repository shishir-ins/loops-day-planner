import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Trash2, Play, Pause, Paperclip, Calendar } from "lucide-react";
import type { Task } from "@/hooks/useTasks";
import TaskMaterials from "./TaskMaterials";
import { useTaskMaterials } from "@/hooks/useTaskMaterials";

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateStopwatch: (id: string, seconds: number, running: boolean) => void;
  onDeadlineClose?: (id: string, name: string) => void;
  isAdmin?: boolean;
}

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h > 0 ? `${h}h ` : ""}${m}m ${sec}s`;
};

const formatDeadline = (deadline: string) => {
  const date = new Date(deadline);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const TaskItem = ({ task, onToggle, onDelete, onUpdateStopwatch, onDeadlineClose, isAdmin }: Props) => {
  const [localSeconds, setLocalSeconds] = useState(task.stopwatch_seconds);
  const [localRunning, setLocalRunning] = useState(task.stopwatch_running);
  const [showMaterials, setShowMaterials] = useState(false);
  const { materials, loading, uploadMaterial, deleteMaterial } = useTaskMaterials(task.id);

  useEffect(() => {
    setLocalSeconds(task.stopwatch_seconds);
    setLocalRunning(task.stopwatch_running);
  }, [task.stopwatch_seconds, task.stopwatch_running]);

  useEffect(() => {
    const checkReminderWindow = () => {
      const diff = new Date(task.deadline).getTime() - Date.now();
      if (diff > 0 && diff <= 24 * 60 * 60 * 1000 && onDeadlineClose) {
        onDeadlineClose(task.id, task.text);
      }
    };

    checkReminderWindow();
    const interval = setInterval(checkReminderWindow, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [task.deadline, task.id, task.text, onDeadlineClose]);

  useEffect(() => {
    if (!localRunning) return;
    const interval = setInterval(() => {
      setLocalSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [localRunning]);

  const handleToggleStopwatch = useCallback(() => {
    const newRunning = !localRunning;
    setLocalRunning(newRunning);
    onUpdateStopwatch(task.id, localSeconds, newRunning);
  }, [localRunning, localSeconds, task.id, onUpdateStopwatch]);

  const isOverdue = new Date(task.deadline).getTime() < Date.now();
  const deadlineLabel = `${isOverdue && !task.completed ? "Overdue" : "Due"} ${formatDeadline(task.deadline)}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`glass rounded-2xl p-4 transition-all duration-200 hover:shadow-lg ${
        task.completed ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 h-6 w-6 flex-shrink-0 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
            task.completed ? "border-primary bg-primary" : "border-muted-foreground/30 hover:border-primary"
          }`}
        >
          {task.completed && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
        </button>

        <div className="min-w-0 flex-1">
          <p className={`font-display font-semibold text-foreground ${task.completed ? "line-through opacity-50" : ""}`}>
            {task.text}
          </p>
          {task.note && <p className="mt-1 text-xs italic text-muted-foreground">Note {task.note}</p>}
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span
              className={`rounded-full px-2 py-0.5 font-medium ${
                isOverdue && !task.completed
                  ? "bg-destructive/15 text-destructive"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <Calendar className="mr-1 inline h-3 w-3" />
              {deadlineLabel}
            </span>
            <span className="rounded-full bg-love/10 px-2 py-0.5 font-medium text-love">
              Timer {formatTime(localSeconds)}
            </span>
            <button
              onClick={() => setShowMaterials(!showMaterials)}
              className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <Paperclip className="mr-1 inline h-3 w-3" />
              {loading ? "..." : materials.length}
            </button>
          </div>
        </div>

        <div className="flex flex-shrink-0 gap-1.5">
          {!isAdmin && (
            <button
              onClick={handleToggleStopwatch}
              className="rounded-xl p-1.5 transition-colors hover:bg-secondary"
              title={localRunning ? "Pause" : "Start timer"}
            >
              {localRunning ? <Pause className="h-4 w-4 text-love" /> : <Play className="h-4 w-4 text-primary" />}
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => onDelete(task.id)}
              className="rounded-xl p-1.5 transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 text-destructive/70" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showMaterials && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 border-t border-border/50 pt-4"
          >
            <TaskMaterials
              taskId={task.id}
              materials={materials}
              onUpload={uploadMaterial}
              onDelete={deleteMaterial}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskItem;
