import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { ResumeRow } from "@/types/supabase";

export async function insertResumeRow(input: {
  userId: string;
  fileUrl: string;
}): Promise<{ data: ResumeRow | null; error: Error | null }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return {
      data: null,
      error: new Error("Set SUPABASE_SERVICE_ROLE_KEY"),
    };
  }

  const { data, error } = await supabase
    .from("resumes")
    .insert({
      user_id: input.userId,
      file_url: input.fileUrl,
      score: null,
      feedback: null,
    })
    .select("id, user_id, file_url, score, feedback, created_at")
    .single();

  if (error) return { data: null, error: new Error(error.message) };
  return { data: data as ResumeRow, error: null };
}

export async function countResumesByUserId(
  userId: string
): Promise<{ count: number; error: Error | null }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { count: 0, error: new Error("Set SUPABASE_SERVICE_ROLE_KEY") };
  }

  const { count, error } = await supabase
    .from("resumes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) return { count: 0, error: new Error(error.message) };
  return { count: count ?? 0, error: null };
}

export async function listResumesByUserId(
  userId: string
): Promise<{ data: ResumeRow[]; error: Error | null }> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { data: [], error: new Error("Set SUPABASE_SERVICE_ROLE_KEY") };
  }

  const { data, error } = await supabase
    .from("resumes")
    .select("id, user_id, file_url, score, feedback, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: new Error(error.message) };
  return { data: (data ?? []) as ResumeRow[], error: null };
}
