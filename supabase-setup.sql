create extension if not exists pgcrypto;

-- Every row belongs to the account that created it.

create table if not exists public.tracker (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  date date,
  name text,
  order_quantity integer,
  price numeric,
  notes text,
  status text
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  date date,
  product text,
  price numeric
);

create table if not exists public.savings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  date date,
  amount numeric,
  notes text
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  stock numeric not null default 0,
  minimum_stock numeric not null default 5
);

alter table public.tracker add column if not exists notes text;
alter table public.tracker add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.expenses add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.savings add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.inventory add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.tracker alter column user_id set default auth.uid();
alter table public.expenses alter column user_id set default auth.uid();
alter table public.savings alter column user_id set default auth.uid();
alter table public.inventory alter column user_id set default auth.uid();

alter table public.tracker enable row level security;
alter table public.expenses enable row level security;
alter table public.savings enable row level security;
alter table public.inventory enable row level security;

drop policy if exists "Allow public read and write access" on public.tracker;
drop policy if exists "Allow public read and write access" on public.expenses;
drop policy if exists "Allow public read and write access" on public.savings;
drop policy if exists "Allow public read and write access" on public.inventory;
drop policy if exists "Users can manage their tracker rows" on public.tracker;
drop policy if exists "Users can manage their expense rows" on public.expenses;
drop policy if exists "Users can manage their savings rows" on public.savings;
drop policy if exists "Users can manage their inventory rows" on public.inventory;

create policy "Allow public read and write access" on public.tracker
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Allow public read and write access" on public.expenses
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their savings rows" on public.savings
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their inventory rows" on public.inventory
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

select pg_notify('pgrst', 'reload schema');
