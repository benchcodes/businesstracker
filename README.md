# ChurroZi

Tracker and expenses app backed by Supabase.

## Setup

1. Create a Supabase project.
2. Open the SQL Editor in Supabase and run [supabase-setup.sql](supabase-setup.sql).
3. In Supabase, open Authentication > Providers and enable Email.
4. Copy your project URL into [`.env.local`](.env.local) as `VITE_SUPABASE_URL`.
5. Copy your publishable key into [`.env.local`](.env.local) as `VITE_SUPABASE_ANON_KEY`.
6. Restart the Vite dev server with `npm run dev`.

Each person creates an account and sees only rows belonging to that account. If
you already had data before enabling authentication, assign those existing rows
to your account in Supabase before using them again; rows without a `user_id`
are intentionally hidden by the new security policies.

## If you see "Could not find the table 'public.tracker' in the schema cache"

That means Supabase has not loaded the `tracker` table yet.

Use this order:

1. Run [supabase-setup.sql](supabase-setup.sql) in the SQL Editor.
2. Wait a moment for the schema cache to refresh.
3. If needed, reload the API schema from the Supabase dashboard.

## Tables expected by the app

- `tracker` with columns: `id`, `created_at`, `date`, `name`, `order_quantity`, `price`, `status`
- `expenses` with columns: `id`, `created_at`, `date`, `product`, `price`
- `savings` with columns: `id`, `created_at`, `date`, `amount`, `notes`
- `inventory` with columns: `id`, `name`, `stock`, `minimum_stock`
