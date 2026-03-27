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

  // Initial fetch
  useEffect(() => {
    const fetchMaterials = async () => {
      if (!taskId) {
        setLoading(false);
        return;
      }

      if (!supabase) {
        console.warn(supabaseConfigError);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from("task_materials")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });
      
      if (!error && data) setMaterials(data);
      setLoading(false);
    };
    
    fetchMaterials();
  }, [taskId]);

  // Real-time subscription
  useEffect(() => {
    if (!taskId || !supabase) return;

    const channel = supabase
      .channel(`task-materials-${taskId}`)
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "task_materials",
          filter: `task_id=eq.${taskId}`
        },
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

  const uploadMaterial = useCallback(async (file: File) => {
    if (!taskId) throw new Error("Task ID is required");
    if (!supabase) throw new Error(supabaseConfigError ?? "Supabase is not configured");

    // Upload file to Supabase storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${taskId}/${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('task-materials')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('task-materials')
      .getPublicUrl(fileName);

    // Insert material record
    const { data: materialData, error: insertError } = await supabase
      .from("task_materials")
      .insert({
        task_id: taskId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: urlData.publicUrl
      })
      .select()
      .single();

    if (insertError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('task-materials')
        .remove([fileName]);
      throw insertError;
    }

    return materialData;
  }, [taskId]);

  const deleteMaterial = useCallback(async (materialId: string) => {
    if (!supabase) throw new Error(supabaseConfigError ?? "Supabase is not configured");

    // Get material info first
    const material = materials.find(m => m.id === materialId);
    if (!material) throw new Error("Material not found");

    // Extract file path from URL
    const urlParts = material.file_url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `${taskId}/${fileName}`;

    // Delete from database
    const { error: dbError } = await supabase
      .from("task_materials")
      .delete()
      .eq("id", materialId);

    if (dbError) throw dbError;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('task-materials')
      .remove([filePath]);

    if (storageError) {
      console.warn("Failed to delete file from storage:", storageError);
    }
  }, [taskId, materials]);

  return { 
    materials, 
    loading, 
    uploadMaterial, 
    deleteMaterial 
  };
};
