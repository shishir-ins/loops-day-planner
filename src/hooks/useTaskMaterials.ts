import { useState, useEffect, useCallback } from "react";
import { supabase, supabaseConfigError } from "@/integrations/supabase/client";

export type TaskMaterial = {
  id: string;
  task_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  created_at: string;
};

export const useTaskMaterials = (taskId: string) => {
  const [materials, setMaterials] = useState<TaskMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!taskId || !supabase) {
        setLoading(false);
        return;
      }

      const { data, error } = await (supabase as any)
        .from("task_materials")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });

      if (!error && data) setMaterials(data as TaskMaterial[]);
      setLoading(false);
    };
    fetchMaterials();
  }, [taskId]);

  useEffect(() => {
    if (!taskId || !supabase) return;
    const channel = supabase
      .channel(`task-materials-${taskId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "task_materials", filter: `task_id=eq.${taskId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMaterials((prev) => [payload.new as TaskMaterial, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setMaterials((prev) => prev.filter((m) => m.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [taskId]);

  const uploadMaterial = useCallback(async (file: File): Promise<void> => {
    if (!taskId || !supabase) throw new Error("Not configured");
    const fileExt = file.name.split('.').pop();
    const fileName = `${taskId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('task-materials')
      .upload(fileName, file);
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('task-materials')
      .getPublicUrl(fileName);

    const { error: insertError } = await (supabase as any)
      .from("task_materials")
      .insert({
        task_id: taskId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: urlData.publicUrl
      });

    if (insertError) {
      await supabase.storage.from('task-materials').remove([fileName]);
      throw insertError;
    }
  }, [taskId]);

  const deleteMaterial = useCallback(async (materialId: string): Promise<void> => {
    if (!supabase) throw new Error("Not configured");
    const material = materials.find(m => m.id === materialId);
    if (!material) throw new Error("Material not found");

    const urlParts = material.file_url.split('/');
    const fName = urlParts[urlParts.length - 1];
    const filePath = `${taskId}/${fName}`;

    await (supabase as any).from("task_materials").delete().eq("id", materialId);
    await supabase.storage.from('task-materials').remove([filePath]).catch(console.warn);
  }, [taskId, materials]);

  return { materials, loading, uploadMaterial, deleteMaterial };
};
