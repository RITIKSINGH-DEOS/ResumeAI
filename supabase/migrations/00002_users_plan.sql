-- Plan for billing: free until purchase, then premium.
alter table public.users
  add column if not exists plan text not null default 'free';

alter table public.users
  drop constraint if exists users_plan_check;

alter table public.users
  add constraint users_plan_check check (plan in ('free', 'premium'));
