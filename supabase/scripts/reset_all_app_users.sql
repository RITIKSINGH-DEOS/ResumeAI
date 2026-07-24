-- ONE-OFF: wipe all rows in public.users (and dependent data).
-- Run in Supabase → SQL Editor when you want a clean slate for app data.
--
-- Effects:
-- - Removes every user and, via ON DELETE CASCADE, all rows in public.resumes.
-- - Does NOT delete files in the Storage "resumes" bucket (clean those separately if needed).
-- - Does NOT change Clerk: users can still sign in; the next sync recreates rows from Clerk.
--   To force everyone "free" in the app, also clear Pro in Clerk (Dashboard → Users → metadata)
--   or use your in-app revoke flow per user.

truncate table public.users cascade;
