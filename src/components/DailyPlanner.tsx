import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Sun, Cloud, CloudRain, Snowflake, Droplets, Clock, CheckSquare, Utensils, FileText, ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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

const WaterGlass = ({ filled, index, total }: { filled: boolean; index: number; total: number }) => {
  const fillPercent = filled ? 100 : 0;
  return (
    <div className="relative w-8 h-10 flex items-end justify-center">
      <svg viewBox="0 0 32 40" className="w-full h-full">
        {/* Glass outline */}
        <path
          d="M6 4 L4 36 Q4 38 6 38 L26 38 Q28 38 28 36 L26 4 Z"
          fill="none"
          stroke="#86efac"
          strokeWidth="2"
        />
        {/* Water fill */}
        <clipPath id={`glass-clip-${index}`}>
          <path d="M6 4 L4 36 Q4 38 6 38 L26 38 Q28 38 28 36 L26 4 Z" />
        </clipPath>
        <rect
          x="4"
          y={4 + (34 * (1 - fillPercent / 100))}
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
  const today = new Date().toISOString().split('T')[0];
  const storedDate = localStorage.getItem('planner-date');
  
  if (storedDate !== today) {
    localStorage.removeItem('daily-planner');
    localStorage.setItem('planner-date', today);
  }

  const [plannerData, setPlannerData] = useState<PlannerData>(() => {
    const saved = localStorage.getItem('daily-planner');
    if (saved) return JSON.parse(saved);
    return {
      mood: '', date: today, selectedDays: [], weather: '',
      hoursOfSleep: 0, howRested: '', reminder: '', waterIntake: 0,
      otherDrinks: '',
      schedule: Array(8).fill(null).map(() => ({ time: '', activity: '' })),
      todo: Array(6).fill(null).map(() => ({ text: '', completed: false })),
      workout: '', totalMinutes: '', totalSteps: '',
      breakfast: '', lunch: '', dinner: '', snacks: '',
      notes: '', forTomorrow: ''
    };
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem('daily-planner', JSON.stringify(plannerData));
  }, [plannerData]);

  const updateField = (field: keyof PlannerData, value: any) => {
    setPlannerData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const saveToDB = async () => {
    if (!supabase) return;
    setSaving(true);
    try {
      await (supabase as any).from("planner_entries").upsert({
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
      }, { onConflict: 'date' });
      setSaved(true);
    } catch (e) {
      console.error("Save failed:", e);
    }
    setSaving(false);
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(saveToDB, 30000);
    return () => clearInterval(interval);
  }, [plannerData]);

  const moods = ['😊', '😐', '😔', '😴', '🤗', '😠'];
  const weathers = [
    { icon: Sun, label: 'sunny' },
    { icon: Cloud, label: 'cloudy' },
    { icon: CloudRain, label: 'rainy' },
    { icon: Snowflake, label: 'snowy' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <h1 className="text-4xl font-bold text-green-800 mb-2">Daily Planner</h1>
          <p className="text-green-600">Organize your day with peace and clarity 🌿</p>
          <button
            onClick={saveToDB}
            disabled={saving}
            className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              saved ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : saved ? 'Saved! ✓' : 'Save to Cloud ☁️'}
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mood Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200"
          >
            <h3 className="text-lg font-semibold text-green-800 mb-4">Mood</h3>
            <div className="flex justify-around flex-wrap gap-2">
              {moods.map((mood) => (
                <button
                  key={mood}
                  onClick={() => updateField('mood', mood)}
                  className={`text-3xl p-2 rounded-xl transition-all ${
                    plannerData.mood === mood
                      ? 'bg-green-100 border-2 border-green-400 scale-110'
                      : 'hover:bg-green-50 border-2 border-transparent'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Date Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200"
          >
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Date
            </h3>
            <input
              type="date"
              value={plannerData.date}
              onChange={(e) => updateField('date', e.target.value)}
              className="w-full p-2 border-2 border-green-200 rounded-lg text-green-800 focus:border-green-400 focus:outline-none"
            />
            <div className="flex justify-around mt-3">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <button
                  key={`${day}-${i}`}
                  onClick={() => {
                    const dayKey = `${day}-${i}`;
                    const newDays = plannerData.selectedDays.includes(dayKey)
                      ? plannerData.selectedDays.filter(d => d !== dayKey)
                      : [...plannerData.selectedDays, dayKey];
                    updateField('selectedDays', newDays);
                  }}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                    plannerData.selectedDays.includes(`${day}-${i}`)
                      ? 'bg-green-500 text-white'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Weather Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200"
          >
            <h3 className="text-lg font-semibold text-green-800 mb-4">Weather</h3>
            <div className="flex justify-around">
              {weathers.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  onClick={() => updateField('weather', label)}
                  className={`p-3 rounded-xl transition-all ${
                    plannerData.weather === label
                      ? 'bg-green-100 border-2 border-green-400'
                      : 'hover:bg-green-50 border-2 border-transparent'
                  }`}
                >
                  <Icon className="w-6 h-6 text-green-600" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Hours of Sleep */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200"
          >
            <h3 className="text-lg font-semibold text-green-800 mb-4">Hours of Sleep</h3>
            <div className="flex justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5, 6, 7].map((star) => (
                <button key={star} onClick={() => updateField('hoursOfSleep', star)} className="text-2xl transition-all">
                  {star <= plannerData.hoursOfSleep ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="How rested I feel..."
              value={plannerData.howRested}
              onChange={(e) => updateField('howRested', e.target.value)}
              className="w-full p-2 border-2 border-green-200 rounded-lg text-green-800 focus:border-green-400 focus:outline-none"
            />
          </motion.div>

          {/* Reminder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200"
          >
            <h3 className="text-lg font-semibold text-green-800 mb-4">Reminder</h3>
            <textarea
              placeholder="Important reminders for today..."
              value={plannerData.reminder}
              onChange={(e) => updateField('reminder', e.target.value)}
              className="w-full p-3 border-2 border-green-200 rounded-lg text-green-800 focus:border-green-400 focus:outline-none h-20 resize-none"
            />
          </motion.div>

          {/* Water Intake with Glass Icons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200"
          >
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5" /> Water
            </h3>
            <div className="flex justify-center gap-2 mb-3">
              {[1, 2, 3, 4, 5, 6, 7].map((glass) => (
                <button key={glass} onClick={() => updateField('waterIntake', glass)} className="transition-all hover:scale-110">
                  <WaterGlass filled={glass <= plannerData.waterIntake} index={glass} total={7} />
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Other drinks..."
              value={plannerData.otherDrinks}
              onChange={(e) => updateField('otherDrinks', e.target.value)}
              className="w-full p-2 border-2 border-green-200 rounded-lg text-green-800 focus:border-green-400 focus:outline-none"
            />
          </motion.div>

          {/* Schedule */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200 md:col-span-2"
          >
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" /> Schedule
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
                      updateField('schedule', newSchedule);
                    }}
                    className="w-24 p-2 border-2 border-green-200 rounded-lg text-green-800 focus:border-green-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Activity..."
                    value={item.activity}
                    onChange={(e) => {
                      const newSchedule = [...plannerData.schedule];
                      newSchedule[i].activity = e.target.value;
                      updateField('schedule', newSchedule);
                    }}
                    className="flex-1 p-2 border-2 border-green-200 rounded-lg text-green-800 focus:border-green-400 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* To Do */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200"
          >
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5" /> To Do
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
                      updateField('todo', newTodo);
                    }}
                    className="w-4 h-4 text-green-600 border-2 border-green-300 rounded focus:ring-green-500"
                  />
                  <input
                    type="text"
                    placeholder="Task..."
                    value={item.text}
                    onChange={(e) => {
                      const newTodo = [...plannerData.todo];
                      newTodo[i].text = e.target.value;
                      updateField('todo', newTodo);
                    }}
                    className="flex-1 p-2 border-2 border-green-200 rounded-lg text-green-800 focus:border-green-400 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Exercise */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200"
          >
            <h3 className="text-lg font-semibold text-green-800 mb-4">Exercise</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Workout..."
                value={plannerData.workout}
                onChange={(e) => updateField('workout', e.target.value)}
                className="w-full p-2 border-2 border-green-200 rounded-lg text-green-800 focus:border-green-400 focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Total minutes..."
                  value={plannerData.totalMinutes}
                  onChange={(e) => updateField('totalMinutes', e.target.value)}
                  className="flex-1 p-2 border-2 border-green-200 rounded-lg text-green-800 focus:border-green-400 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Total steps..."
                  value={plannerData.totalSteps}
                  onChange={(e) => updateField('totalSteps', e.target.value)}
                  className="flex-1 p-2 border-2 border-green-200 rounded-lg text-green-800 focus:border-green-400 focus:outline-none"
                />
              </div>
            </div>
          </motion.div>

          {/* Meal Tracker */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200 md:col-span-2"
          >
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
              <Utensils className="w-5 h-5" /> Meal Tracker
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                { key: 'breakfast', label: 'Breakfast' },
                { key: 'lunch', label: 'Lunch' },
                { key: 'dinner', label: 'Dinner' },
                { key: 'snacks', label: 'Snacks' }
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-green-700 mb-1">{label}</label>
                  <input
                    type="text"
                    placeholder={label}
                    value={plannerData[key as keyof PlannerData] as string}
                    onChange={(e) => updateField(key as keyof PlannerData, e.target.value)}
                    className="w-full p-2 border-2 border-green-200 rounded-lg text-green-800 focus:border-green-400 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200"
          >
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Notes
            </h3>
            <textarea
              placeholder="Notes for today..."
              value={plannerData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className="w-full p-3 border-2 border-green-200 rounded-lg text-green-800 focus:border-green-400 focus:outline-none h-32 resize-none"
            />
          </motion.div>

          {/* For Tomorrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200"
          >
            <h3 className="text-lg font-semibold text-green-800 mb-4">For Tomorrow</h3>
            <textarea
              placeholder="Plans for tomorrow..."
              value={plannerData.forTomorrow}
              onChange={(e) => updateField('forTomorrow', e.target.value)}
              className="w-full p-3 border-2 border-green-200 rounded-lg text-green-800 focus:border-green-400 focus:outline-none h-32 resize-none"
            />
          </motion.div>
        </div>

        {/* Planner Reports Tab */}
        <PlannerReports />
      </div>
    </div>
  );
};

export default DailyPlanner;
