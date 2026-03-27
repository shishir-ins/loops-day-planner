
-- Tasks table - personal app with passcode system
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  stopwatch_seconds INTEGER NOT NULL DEFAULT 0,
  stopwatch_running BOOLEAN NOT NULL DEFAULT false,
  note TEXT
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Allow all operations (passcode checked in app layer)
CREATE POLICY "Allow all read access" ON public.tasks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert access" ON public.tasks FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update access" ON public.tasks FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow all delete access" ON public.tasks FOR DELETE TO anon, authenticated USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
