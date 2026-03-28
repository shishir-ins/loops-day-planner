
CREATE TABLE public.planner_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  mood text,
  weather text,
  hours_of_sleep integer DEFAULT 0,
  how_rested text,
  reminder text,
  water_intake integer DEFAULT 0,
  other_drinks text,
  schedule jsonb DEFAULT '[]'::jsonb,
  todo jsonb DEFAULT '[]'::jsonb,
  workout text,
  total_minutes text,
  total_steps text,
  breakfast text,
  lunch text,
  dinner text,
  snacks text,
  notes text,
  for_tomorrow text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(date)
);

ALTER TABLE public.planner_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read access" ON public.planner_entries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert access" ON public.planner_entries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update access" ON public.planner_entries FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow all delete access" ON public.planner_entries FOR DELETE TO anon, authenticated USING (true);

CREATE TRIGGER update_planner_entries_updated_at
  BEFORE UPDATE ON public.planner_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
