import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, BarChart3, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ReportPeriod = "weekly" | "monthly" | "yearly";

interface PlannerEntry {
  id: string;
  date: string;
  mood: string;
  weather: string;
  hours_of_sleep: number;
  water_intake: number;
  workout: string;
  total_minutes: string;
  total_steps: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  notes: string;
  todo: any[];
  schedule: any[];
  created_at: string;
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const PlannerReports = () => {
  const [period, setPeriod] = useState<ReportPeriod>("weekly");
  const [entries, setEntries] = useState<PlannerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      if (!supabase) return;
      setLoading(true);

      const now = new Date();
      let startDate: Date;

      if (period === "weekly") {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
      } else if (period === "monthly") {
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
      } else {
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
      }

      const { data, error } = await (supabase as any)
        .from("planner_entries")
        .select("*")
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: false });

      if (!error && data) setEntries(data);
      setLoading(false);
    };
    fetchEntries();
  }, [period]);

  const avgSleep = entries.length > 0
    ? (entries.reduce((sum, e) => sum + (e.hours_of_sleep || 0), 0) / entries.length).toFixed(1)
    : "0";

  const avgWater = entries.length > 0
    ? (entries.reduce((sum, e) => sum + (e.water_intake || 0), 0) / entries.length).toFixed(1)
    : "0";

  const moodCounts: Record<string, number> = {};
  entries.forEach((e) => {
    if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
  });
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const totalWorkouts = entries.filter((e) => e.workout && e.workout.trim()).length;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const periodLabels: Record<ReportPeriod, string> = {
    weekly: "This Week",
    monthly: "This Month",
    yearly: "This Year",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-green-800 flex items-center justify-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Planner Reports 📊
        </h2>
        <p className="text-green-600 text-sm mt-1">See how you've been doing, loops! 💕</p>
      </div>

      {/* Period Tabs */}
      <div className="flex justify-center gap-2 mb-6">
        {(["weekly", "monthly", "yearly"] as ReportPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              period === p
                ? "bg-green-500 text-white shadow-md"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {p === "weekly" ? "📅 Weekly" : p === "monthly" ? "🗓️ Monthly" : "🎯 Yearly"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-green-600 animate-pulse">Loading your report... 🌿</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-2xl shadow-lg border-2 border-green-200 p-6">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-green-600">No planner entries for {periodLabels[period].toLowerCase()} yet!</p>
          <p className="text-green-500 text-sm mt-1">Start filling out your daily planner and check back 💕</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Days Tracked", value: entries.length, emoji: "📋" },
              { label: "Avg Sleep", value: `${avgSleep}h`, emoji: "😴" },
              { label: "Avg Water", value: `${avgWater} glasses`, emoji: "💧" },
              { label: "Top Mood", value: topMood, emoji: "✨" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-4 text-center"
              >
                <p className="text-2xl mb-1">{stat.emoji}</p>
                <p className="text-xl font-bold text-green-800">{stat.value}</p>
                <p className="text-xs text-green-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Extra Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-5">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Mood Distribution
              </h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(moodCounts).map(([mood, count]) => (
                  <div key={mood} className="flex items-center gap-1 bg-green-50 rounded-full px-3 py-1">
                    <span className="text-xl">{mood}</span>
                    <span className="text-sm font-medium text-green-700">× {count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-5">
              <h3 className="font-semibold text-green-800 mb-3">🏋️ Workout Summary</h3>
              <p className="text-green-700">
                <span className="text-2xl font-bold text-green-800">{totalWorkouts}</span> workout
                {totalWorkouts !== 1 ? "s" : ""} logged out of {entries.length} days
              </p>
              <div className="mt-2 w-full bg-green-100 rounded-full h-3">
                <div
                  className="bg-green-500 rounded-full h-3 transition-all"
                  style={{ width: `${entries.length > 0 ? (totalWorkouts / entries.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Detailed Day-by-Day */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-5">
            <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Day-by-Day Details
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-2 border-green-100 rounded-xl p-4 hover:border-green-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-green-800 text-sm">{formatDate(entry.date)}</p>
                    <div className="flex items-center gap-2">
                      {entry.mood && <span className="text-lg">{entry.mood}</span>}
                      {entry.weather && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{entry.weather}</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-green-700">
                    <span>😴 {entry.hours_of_sleep || 0}h sleep</span>
                    <span>💧 {entry.water_intake || 0} glasses</span>
                    {entry.workout && <span>🏋️ {entry.workout}</span>}
                    {entry.breakfast && <span>🍳 {entry.breakfast}</span>}
                    {entry.lunch && <span>🍱 {entry.lunch}</span>}
                    {entry.dinner && <span>🍽️ {entry.dinner}</span>}
                  </div>
                  {entry.notes && (
                    <p className="text-xs text-green-600 mt-2 italic">📝 {entry.notes}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default PlannerReports;
