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

-- Shared business identity. Logo files are stored separately in Storage so
-- they can be loaded from every device without putting image data in auth tokens.
create table if not exists public.business_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  business_name text not null default 'Benzi Tracker',
  logo_url text not null default '/benzi-logo.svg',
  updated_at timestamptz not null default now()
);

alter table public.tracker add column if not exists notes text;
alter table public.tracker add column if not exists product text;
alter table public.tracker add column if not exists product_price numeric;
alter table public.tracker add column if not exists variant_pcs numeric;
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
alter table public.business_settings enable row level security;

drop policy if exists "Allow public read and write access" on public.tracker;
drop policy if exists "Allow public read and write access" on public.expenses;
drop policy if exists "Allow public read and write access" on public.savings;
drop policy if exists "Allow public read and write access" on public.inventory;
drop policy if exists "Users can manage their tracker rows" on public.tracker;
drop policy if exists "Users can manage their expense rows" on public.expenses;
drop policy if exists "Users can manage their savings rows" on public.savings;
drop policy if exists "Users can manage their inventory rows" on public.inventory;
drop policy if exists "Users can manage their business settings" on public.business_settings;

create policy "Allow public read and write access" on public.tracker
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Allow public read and write access" on public.expenses
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their savings rows" on public.savings
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their inventory rows" on public.inventory
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their business settings" on public.business_settings
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('business-logos', 'business-logos', true)
on conflict (id) do update set public = true;

drop policy if exists "Users can upload their business logos" on storage.objects;
drop policy if exists "Users can update their business logos" on storage.objects;
drop policy if exists "Users can delete their business logos" on storage.objects;

create policy "Users can upload their business logos" on storage.objects
for insert to authenticated
with check (bucket_id = 'business-logos' and owner_id = auth.uid()::text);

create policy "Users can update their business logos" on storage.objects
for update to authenticated
using (bucket_id = 'business-logos' and owner_id = auth.uid()::text)
with check (bucket_id = 'business-logos' and owner_id = auth.uid()::text);

create policy "Users can delete their business logos" on storage.objects
for delete to authenticated
using (bucket_id = 'business-logos' and owner_id = auth.uid()::text);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'business_settings'
  ) then
    alter publication supabase_realtime add table public.business_settings;
  end if;
end $$;

select pg_notify('pgrst', 'reload schema');
