-- Add user preferences columns to profiles table

-- Add tax_rate column if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'tax_rate') then
    alter table public.profiles add column tax_rate numeric default 0;
  end if;
end $$;

-- Add payment_delay column if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'payment_delay') then
    alter table public.profiles add column payment_delay boolean default false;
  end if;
end $$;

-- Add preferences column if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'preferences') then
    alter table public.profiles add column preferences jsonb default '{}'::jsonb;
  end if;
end $$;
