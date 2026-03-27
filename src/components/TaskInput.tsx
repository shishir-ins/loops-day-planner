import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, CalendarIcon, Clock, MessageCircleHeart } from "lucide-react";

interface Props {
  onAdd: (text: string, deadline: string, note?: string) => void;
}

const TaskInput = ({ onAdd }: Props) => {
  const [text, setText] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !date) return;
    const deadlineStr = `${date}T${time || "23:59"}`;
    onAdd(text.trim(), deadlineStr, note.trim() || undefined);
    setText("");
    setDate("");
    setTime("");
    setNote("");
    setExpanded(false);
  };

  return (
    <motion.form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-4 space-y-3" layout>
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (!expanded && e.target.value) setExpanded(true);
          }}
          onFocus={() => setExpanded(true)}
          placeholder="Add a task for loops 🌸"
          className="flex-1 bg-secondary/50 rounded-xl px-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-primary text-primary-foreground rounded-xl px-4 py-2.5 font-display font-semibold text-sm flex items-center gap-1.5 shadow-md hover:shadow-lg transition-shadow"
        >
          <Plus className="w-4 h-4" />
          Add
        </motion.button>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-2"
        >
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-secondary/50 rounded-xl px-3 py-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-sm font-body text-foreground focus:outline-none" />
            </div>
            <div className="flex items-center gap-1.5 bg-secondary/50 rounded-xl px-3 py-2">
              <Clock className="w-4 h-4 text-love" />
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="bg-transparent text-sm font-body text-foreground focus:outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-secondary/50 rounded-xl px-3 py-2">
            <MessageCircleHeart className="w-4 h-4 text-love" />
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Add a love note 💌 (optional)"
              className="flex-1 bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none" />
          </div>
        </motion.div>
      )}
    </motion.form>
  );
};

export default TaskInput;
