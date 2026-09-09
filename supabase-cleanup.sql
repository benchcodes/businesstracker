-- One-time database cleanup for branding features removed from the app.
-- This does NOT affect tracker, expenses, savings, inventory, or auth users.
--
-- Delete the business-logos bucket separately in Dashboard > Storage.
-- Supabase requires Storage files to be deleted through its Storage API or UI,
-- never with a direct SQL DELETE statement.

drop policy if exists "Users can upload their business logos" on storage.objects;
drop policy if exists "Users can update their business logos" on storage.objects;
drop policy if exists "Users can delete their business logos" on storage.objects;

do $$
begin
  if exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'business_settings'
  ) then
    alter publication supabase_realtime drop table public.business_settings;
  end if;
end $$;

drop table if exists public.business_settings;

select pg_notify('pgrst', 'reload schema');
