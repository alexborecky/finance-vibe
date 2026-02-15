-- Add metadata column to transactions table
alter table public.transactions add column if not exists metadata jsonb default '{}'::jsonb;
