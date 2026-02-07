-- Add missing columns to profiles table
alter table public.profiles 
add column if not exists tax_rate numeric default 0,
add column if not exists payment_delay boolean default false,
add column if not exists preferences jsonb default '{}'::jsonb,
add column if not exists income_adjustments jsonb default '{}'::jsonb;
