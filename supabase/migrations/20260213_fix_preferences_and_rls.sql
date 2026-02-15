-- Ensure 'preferences' column exists in 'profiles' table
alter table if exists public.profiles 
add column if not exists preferences jsonb default '{}'::jsonb;

-- Ensure RLS is enabled
alter table public.profiles enable row level security;

-- Re-create update policy to ensure users can update their own profile
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can update own profile" on public.profiles 
  for update using (auth.uid() = id);

-- Grant access to authenticated users if needed (usually handled by default in Supabase)
grant update (preferences) on table public.profiles to authenticated;
