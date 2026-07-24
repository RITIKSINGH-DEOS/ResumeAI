export type UserPlan = "free" | "premium";

export type UserRow = {
  id: string;
  clerk_id: string;
  email: string;
  name: string;
  /** Supabase: `free` until purchase, then `premium` (synced with Clerk Pro via grant/revoke). */
  plan: UserPlan;
  created_at: string;
};

export type ResumeRow = {
  id: string;
  user_id: string;
  file_url: string;
  score: number | null;
  feedback: unknown | null;
  created_at: string;
};
