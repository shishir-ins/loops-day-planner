import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import {
  Calendar,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Droplets,
  Clock,
  CheckSquare,
  Utensils,
  FileText,
  Download,
  ArrowLeft,
  Save,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import PlannerReports from "./PlannerReports";

interface PlannerData {
  mood: string;
  date: string;
  selectedDays: string[];
  weather: string;
  hoursOfSleep: number;
  howRested: string;
  reminder: string;
  waterIntake: number;
  otherDrinks: string;
  schedule: { time: string; activity: string }[];
  todo: { text: string; completed: boolean }[];
  workout: string;
  totalMinutes: string;
  totalSteps: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  notes: string;
  forTomorrow: string;
}

const WaterGlass = ({ filled, index }: { filled: boolean; index: number }) => {
  const fillPercent = filled ? 100 : 0;

  return (
    <div className="relative flex h-10 w-8 items-end justify-center">
      <svg viewBox="0 0 32 40" className="h-full w-full">
        <path
          d="M6 4 L4 36 Q4 38 6 38 L26 38 Q28 38 28 36 L26 4 Z"
          fill="none"
          stroke="#86efac"
          strokeWidth="2"
        />
        <clipPath id={`glass-clip-${index}`}>
          <path d="M6 4 L4 36 Q4 38 6 38 L26 38 Q28 38 28 36 L26 4 Z" />
        </clipPath>
        <rect
          x="4"
          y={4 + 34 * (1 - fillPercent / 100)}
          width="24"
          height={34 * (fillPercent / 100)}
          fill="#60a5fa"
          opacity="0.6"
          clipPath={`url(#glass-clip-${index})`}
          className="transition-all duration-500"
        />
      </svg>
    </div>
  );
};

const DailyPlanner = () => {
  const today = new Date().toISOString().split("T")[0];
  const storedDate = localStorage.getItem("planner-date");
  const plannerRef = useRef<HTMLDivElement>(null);

  if (storedDate !== today) {
    localStorage.removeItem("daily-planner");
    localStorage.setItem("planner-date", today);
  }

  const [plannerData, setPlannerData] = useState<PlannerData>(() => {
    const saved = localStorage.getItem("daily-planner");
    if (saved) return JSON.parse(saved);

    return {
      mood: "",
      date: today,
      selectedDays: [],
      weather: "",
      hoursOfSleep: 0,
      howRested: "",
      reminder: "",
      waterIntake: 0,
      otherDrinks: "",
      schedule: Array(8)
        .fill(null)
        .map(() => ({ time: "", activity: "" })),
      todo: Array(6)
        .fill(null)
        .map(() => ({ text: "", completed: false })),
      workout: "",
      totalMinutes: "",
      totalSteps: "",
      breakfast: "",
      lunch: "",
      dinner: "",
      snacks: "",
      notes: "",
      forTomorrow: "",
    };
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    localStorage.setItem("daily-planner", JSON.stringify(plannerData));
  }, [plannerData]);

  const updateField = <K extends keyof PlannerData>(field: K, value: PlannerData[K]) => {
    setPlannerData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const saveToDB = async () => {
    if (!supabase) return;

    setSaving(true);

    try {
      await (supabase as any).from("planner_entries").upsert(
        {
          date: plannerData.date,
          mood: plannerData.mood,
          weather: plannerData.weather,
          hours_of_sleep: plannerData.hoursOfSleep,
          how_rested: plannerData.howRested,
          reminder: plannerData.reminder,
          water_intake: plannerData.waterIntake,
          other_drinks: plannerData.otherDrinks,
          schedule: plannerData.schedule,
          todo: plannerData.todo,
          workout: plannerData.workout,
          total_minutes: plannerData.totalMinutes,
          total_steps: plannerData.totalSteps,
          breakfast: plannerData.breakfast,
          lunch: plannerData.lunch,
          dinner: plannerData.dinner,
          snacks: plannerData.snacks,
          notes: plannerData.notes,
          for_tomorrow: plannerData.forTomorrow,
        },
        { onConflict: "date" }
      );
      setSaved(true);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      void saveToDB();
    }, 30000);

    return () => clearInterval(interval);
  }, [plannerData]);

  const handleDownloadPng = async () => {
    if (!plannerRef.current) return;

    setIsDownloading(true);
    setDownloadError("");

    try {
      const dataUrl = await toPng(plannerRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#f0fdf4",
        filter: (node) => !(node instanceof HTMLElement && node.dataset.exportIgnore === "true"),
      });

      const link = document.createElement("a");
      link.download = `loops-day-planner-${plannerData.date || today}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to export planner as PNG:", error);
      setDownloadError("Couldn't download the PNG right now. Try again in a second.");
    } finally {
      setIsDownloading(false);
    }
  };

  const moods = ["😊", "😐", "😔", "😴", "🤗", "😠"];
  const weathers = [
    { icon: Sun, label: "sunny" },
    { icon: Cloud, label: "cloudy" },
    { icon: CloudRain, label: "rainy" },
    { icon: Snowflake, label: "snowy" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-4">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1 text-sm text-green-600 transition-colors hover:text-green-800"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <h1 className="mb-2 text-4xl font-bold text-green-800">Daily Planner</h1>
          <p className="text-green-600">Organize your day with peace and clarity 🌿</p>
          <button
            onClick={() => {
              void saveToDB();
            }}
            disabled={saving}
            className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              saved ? "bg-green-500 text-white" : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : saved ? "Saved! ✓" : "Save to Cloud ☁️"}
          </button>
        </motion.div>

        <div
          data-export-ignore="true"
          className="mb-6 flex flex-col gap-3 rounded-2xl border border-green-200 bg-white/90 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="text-sm font-medium text-green-800">Save the finished day as a memory</p>
            <p className="text-sm text-green-700/80">
              Download the full planner page as a PNG whenever you want to keep that day&apos;s snapshot.
            </p>
          </div>
          <Button
            type="button"
            onClick={handleDownloadPng}
            disabled={isDownloading}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "Preparing PNG..." : "Download Day as PNG"}
          </Button>
        </div>

        {downloadError && (
          <div
            data-export-ignore="true"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {downloadError}
          </div>
        )}

        <div ref={plannerRef}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border-2 border-green-200 bg-white p-6 shadow-lg"
            >
              <h3 className="mb-4 text-lg font-semibold text-green-800">Mood</h3>
              <div className="flex flex-wrap justify-around gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => updateField("mood", mood)}
                    className={`rounded-xl p-2 text-3xl transition-all ${
                      plannerData.mood === mood
                        ? "scale-110 border-2 border-green-400 bg-green-100"
                        : "border-2 border-transparent hover:bg-green-50"
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border-2 border-green-200 bg-white p-6 shadow-lg"
            >
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-800">
                <Calendar className="h-5 w-5" />
                Date
              </h3>
              <input
                type="date"
                value={plannerData.date}
                onChange={(e) => updateField("date", e.target.value)}
                className="w-full rounded-lg border-2 border-green-200 p-2 text-green-800 focus:border-green-400 focus:outline-none"
              />
              <div className="mt-3 flex justify-around">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                  <button
                    key={`${day}-${i}`}
                    onClick={() => {
                      const dayKey = `${day}-${i}`;
                      const newDays = plannerData.selectedDays.includes(dayKey)
                        ? plannerData.selectedDays.filter((d) => d !== dayKey)
                        : [...plannerData.selectedDays, dayKey];
                      updateField("selectedDays", newDays);
                    }}
                    className={`h-8 w-8 rounded-full text-sm font-medium transition-all ${
                      plannerData.selectedDays.includes(`${day}-${i}`)
                        ? "bg-green-500 text-white"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border-2 border-green-200 bg-white p-6 shadow-lg"
            >
              <h3 className="mb-4 text-lg font-semibold text-green-800">Weather</h3>
              <div className="flex justify-around">
                {weathers.map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    onClick={() => updateField("weather", label)}
                    className={`rounded-xl p-3 transition-all ${
                      plannerData.weather === label
                        ? "border-2 border-green-400 bg-green-100"
                        : "border-2 border-transparent hover:bg-green-50"
                    }`}
                  >
                    <Icon className="h-6 w-6 text-green-600" />
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border-2 border-green-200 bg-white p-6 shadow-lg"
            >
              <h3 className="mb-4 text-lg font-semibold text-green-800">Hours of Sleep</h3>
              <div className="mb-3 flex justify-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((star) => (
                  <button
                    key={star}
                    onClick={() => updateField("hoursOfSleep", star)}
                    className="text-2xl transition-all"
                  >
                    {star <= plannerData.hoursOfSleep ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="How rested I feel..."
                value={plannerData.howRested}
                onChange={(e) => updateField("howRested", e.target.value)}
                className="w-full rounded-lg border-2 border-green-200 p-2 text-green-800 focus:border-green-400 focus:outline-none"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl border-2 border-green-200 bg-white p-6 shadow-lg"
            >
              <h3 className="mb-4 text-lg font-semibold text-green-800">Reminder</h3>
              <textarea
                placeholder="Important reminders for today..."
                value={plannerData.reminder}
                onChange={(e) => updateField("reminder", e.target.value)}
                className="h-20 w-full resize-none rounded-lg border-2 border-green-200 p-3 text-green-800 focus:border-green-400 focus:outline-none"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="rounded-2xl border-2 border-green-200 bg-white p-6 shadow-lg"
            >
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-800">
                <Droplets className="h-5 w-5" />
                Water
              </h3>
              <div className="mb-3 flex justify-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((glass) => (
                  <button
                    key={glass}
                    onClick={() => updateField("waterIntake", glass)}
                    className="transition-all hover:scale-110"
                  >
                    <WaterGlass filled={glass <= plannerData.waterIntake} index={glass} />
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Other drinks..."
                value={plannerData.otherDrinks}
                onChange={(e) => updateField("otherDrinks", e.target.value)}
                className="w-full rounded-lg border-2 border-green-200 p-2 text-green-800 focus:border-green-400 focus:outline-none"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="rounded-2xl border-2 border-green-200 bg-white p-6 shadow-lg md:col-span-2"
            >
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-800">
                <Clock className="h-5 w-5" />
                Schedule
              </h3>
              <div className="space-y-2">
                {plannerData.schedule.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="time"
                      value={item.time}
                      onChange={(e) => {
                        const newSchedule = [...plannerData.schedule];
                        newSchedule[i].time = e.target.value;
                        updateField("schedule", newSchedule);
                      }}
                      className="w-24 rounded-lg border-2 border-green-200 p-2 text-green-800 focus:border-green-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Activity..."
                      value={item.activity}
                      onChange={(e) => {
                        const newSchedule = [...plannerData.schedule];
                        newSchedule[i].activity = e.target.value;
                        updateField("schedule", newSchedule);
                      }}
                      className="flex-1 rounded-lg border-2 border-green-200 p-2 text-green-800 focus:border-green-400 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="rounded-2xl border-2 border-green-200 bg-white p-6 shadow-lg"
            >
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-800">
                <CheckSquare className="h-5 w-5" />
                To Do
              </h3>
              <div className="space-y-2">
                {plannerData.todo.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(e) => {
                        const newTodo = [...plannerData.todo];
                        newTodo[i].completed = e.target.checked;
                        updateField("todo", newTodo);
                      }}
                      className="h-4 w-4 rounded border-2 border-green-300 text-green-600 focus:ring-green-500"
                    />
                    <input
                      type="text"
                      placeholder="Task..."
                      value={item.text}
                      onChange={(e) => {
                        const newTodo = [...plannerData.todo];
                        newTodo[i].text = e.target.value;
                        updateField("todo", newTodo);
                      }}
                      className="flex-1 rounded-lg border-2 border-green-200 p-2 text-green-800 focus:border-green-400 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 }}
              className="rounded-2xl border-2 border-green-200 bg-white p-6 shadow-lg"
            >
              <h3 className="mb-4 text-lg font-semibold text-green-800">Exercise</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Workout..."
                  value={plannerData.workout}
                  onChange={(e) => updateField("workout", e.target.value)}
                  className="w-full rounded-lg border-2 border-green-200 p-2 text-green-800 focus:border-green-400 focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Total minutes..."
                    value={plannerData.totalMinutes}
                    onChange={(e) => updateField("totalMinutes", e.target.value)}
                    className="flex-1 rounded-lg border-2 border-green-200 p-2 text-green-800 focus:border-green-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Total steps..."
                    value={plannerData.totalSteps}
                    onChange={(e) => updateField("totalSteps", e.target.value)}
                    className="flex-1 rounded-lg border-2 border-green-200 p-2 text-green-800 focus:border-green-400 focus:outline-none"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0 }}
              className="rounded-2xl border-2 border-green-200 bg-white p-6 shadow-lg md:col-span-2"
            >
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-800">
                <Utensils className="h-5 w-5" />
                Meal Tracker
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                {[
                  { key: "breakfast", label: "Breakfast" },
                  { key: "lunch", label: "Lunch" },
                  { key: "dinner", label: "Dinner" },
                  { key: "snacks", label: "Snacks" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="mb-1 block text-sm font-medium text-green-700">{label}</label>
                    <input
                      type="text"
                      placeholder={label}
                      value={plannerData[key as keyof PlannerData] as string}
                      onChange={(e) => updateField(key as keyof PlannerData, e.target.value)}
                      className="w-full rounded-lg border-2 border-green-200 p-2 text-green-800 focus:border-green-400 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 }}
              className="rounded-2xl border-2 border-green-200 bg-white p-6 shadow-lg"
            >
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-800">
                <FileText className="h-5 w-5" />
                Notes
              </h3>
              <textarea
                placeholder="Notes for today..."
                value={plannerData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                className="h-32 w-full resize-none rounded-lg border-2 border-green-200 p-3 text-green-800 focus:border-green-400 focus:outline-none"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              className="rounded-2xl border-2 border-green-200 bg-white p-6 shadow-lg"
            >
              <h3 className="mb-4 text-lg font-semibold text-green-800">For Tomorrow</h3>
              <textarea
                placeholder="Plans for tomorrow..."
                value={plannerData.forTomorrow}
                onChange={(e) => updateField("forTomorrow", e.target.value)}
                className="h-32 w-full resize-none rounded-lg border-2 border-green-200 p-3 text-green-800 focus:border-green-400 focus:outline-none"
              />
            </motion.div>
          </div>
        </div>

        <PlannerReports />
      </div>
    </div>
  );
};

export default DailyPlanner;
