-- Task materials table - store files related to tasks
CREATE TABLE public.task_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_materials ENABLE ROW LEVEL SECURITY;

-- Allow all operations (passcode checked in app layer)
CREATE POLICY "Allow all read access" ON public.task_materials FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert access" ON public.task_materials FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update access" ON public.task_materials FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow all delete access" ON public.task_materials FOR DELETE TO anon, authenticated USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_materials;
