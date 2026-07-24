-- Run in Supabase SQL Editor or via CLI. Enables RLS; app uses service role from API routes (Clerk verified server-side).

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  clerk_id text not null unique,
  email text not null default '',
  name text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  file_url text not null,
  score integer,
  feedback jsonb,
  created_at timestamptz not null default now()
);

create index if not exists resumes_user_id_created_at_idx on public.resumes (user_id, created_at desc);

alter table public.users enable row level security;
alter table public.resumes enable row level security;

drop policy if exists "block_anon_users" on public.users;
drop policy if exists "block_anon_resumes" on public.resumes;

-- Deny direct anon/authenticated Supabase JWT access; service role bypasses RLS.
create policy "block_anon_users" on public.users for all using (false) with check (false);
create policy "block_anon_resumes" on public.resumes for all using (false) with check (false);

-- Storage bucket (PDFs). Service role uploads from Next.js API; optional public read via URL.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resumes', 'resumes', true, 10485760, array['application/pdf']::text[])
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public_read_resumes_bucket" on storage.objects;

-- Public read of objects (URLs are unguessable UUID paths). Tighten to signed URLs if needed.
create policy "public_read_resumes_bucket"
on storage.objects for select
to public
using (bucket_id = 'resumes');
