create extension if not exists pgcrypto;

create table if not exists public.tracker (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  date date,
  name text,
  order_quantity integer,
  price numeric,
  status text
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  date date,
  product text,
  price numeric
);

alter table public.tracker enable row level security;
alter table public.expenses enable row level security;

create policy "Allow public read and write access" on public.tracker
for all using (true) with check (true);

create policy "Allow public read and write access" on public.expenses
for all using (true) with check (true);
