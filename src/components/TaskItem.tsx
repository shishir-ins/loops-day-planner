import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Trash2, Play, Pause, Timer } from "lucide-react";
import { Task } from "@/types/task";

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStopwatch: (id: string) => void;
  onTick: (id: string) => void;
  onDeadlineClose: (name: string) => void;
}

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h > 0 ? `${h}h ` : ""}${m}m ${sec}s`;
};

const getCountdown = (deadline: string) => {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "⏰ Overdue!";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h left`;
  return `${h}h ${m}m left`;
};

const TaskItem = ({ task, onToggle, onDelete, onToggleStopwatch, onTick, onDeadlineClose }: Props) => {
  const [countdown, setCountdown] = useState(getCountdown(task.deadline));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(task.deadline));
      const diff = new Date(task.deadline).getTime() - Date.now();
      if (diff > 0 && diff < 5 * 60 * 1000) {
        onDeadlineClose(task.text);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [task.deadline, task.text, onDeadlineClose]);

  useEffect(() => {
    if (!task.stopwatchRunning) return;
    const interval = setInterval(() => onTick(task.id), 1000);
    return () => clearInterval(interval);
  }, [task.stopwatchRunning, task.id, onTick]);

  const isOverdue = new Date(task.deadline).getTime() < Date.now();

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
          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            task.completed
              ? "bg-primary border-primary"
              : "border-muted-foreground/30 hover:border-primary"
          }`}
        >
          {task.completed && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
        </button>

        <div className="flex-1 min-w-0">
          <p
            className={`font-display font-semibold text-foreground ${
              task.completed ? "line-through opacity-50" : ""
            }`}
          >
            {task.text}
          </p>

          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            <span
              className={`px-2 py-0.5 rounded-full font-medium ${
                isOverdue && !task.completed
                  ? "bg-destructive/15 text-destructive"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              ⏳ {countdown}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-love/10 text-love font-medium">
              ⏱ {formatTime(task.stopwatchSeconds)}
            </span>
          </div>
        </div>

        <div className="flex gap-1.5 flex-shrink-0">
          <button
            onClick={() => onToggleStopwatch(task.id)}
            className="p-1.5 rounded-xl hover:bg-secondary transition-colors"
            title={task.stopwatchRunning ? "Pause" : "Start timer"}
          >
            {task.stopwatchRunning ? (
              <Pause className="w-4 h-4 text-love" />
            ) : (
              <Play className="w-4 h-4 text-primary" />
            )}
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-xl hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-destructive/70" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskItem;
