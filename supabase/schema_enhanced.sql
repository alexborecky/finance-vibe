-- Enhanced Schema with Admin Roles and User Management
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES Table (Extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text not null default 'user' check (role in ('superadmin', 'admin', 'user')),
  invited_by uuid references public.profiles(id),
  income_mode text not null default 'fixed' check (income_mode in ('fixed', 'hourly', 'manual')),
  income_amount numeric default 0,
  hourly_rate numeric default 0,
  hours_per_week numeric default 0,
  tax_rate numeric default 0,
  payment_delay boolean default false,
  preferences jsonb default '{}'::jsonb,
  income_adjustments jsonb default '{}'::jsonb,
  currency text default 'CZK',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;

create policy "Users can view own profile" on public.profiles 
  for select using (auth.uid() = id);

-- New function to safely check admin status without recursion
create or replace function public.is_admin()
returns boolean 
language plpgsql 
security definer 
set search_path = public
as $$
begin
  -- Return false if not logged in
  if auth.uid() is null then 
    return false; 
  end if;

  return exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('superadmin', 'admin')
  );
end;
$$;

create policy "Admins can view all profiles" on public.profiles 
  for select using (
    (auth.uid() <> id) AND public.is_admin()
  );

create policy "Users can update own profile" on public.profiles 
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles 
  for insert with check (auth.uid() = id);

-- 2. INVITATIONS Table
create table if not exists public.invitations (
  id uuid default uuid_generate_v4() primary key,
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  invited_by uuid references public.profiles(id) on delete cascade not null,
  token text unique not null,
  expires_at timestamp with time zone not null,
  used boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Invitations
alter table public.invitations enable row level security;

drop policy if exists "Admins can manage invitations" on public.invitations;

create policy "Admins can manage invitations" on public.invitations
  using (public.is_admin());

-- 3. GOALS Table
create table if not exists public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  target_amount numeric not null check (target_amount > 0),
  current_amount numeric default 0 check (current_amount >= 0),
  type text not null check (type in ('short-term', 'long-term')),
  deadline date,
  saving_strategy text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Goals
alter table public.goals enable row level security;

drop policy if exists "Users can CRUD own goals" on public.goals;

create policy "Users can CRUD own goals" on public.goals 
  using (auth.uid() = user_id);

-- 4. TRANSACTIONS Table
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric not null check (amount > 0),
  category text not null check (category in ('need', 'want', 'saving', 'income')),
  description text,
  date date default CURRENT_DATE,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Transactions
alter table public.transactions enable row level security;

drop policy if exists "Users can CRUD own transactions" on public.transactions;

create policy "Users can CRUD own transactions" on public.transactions 
  using (auth.uid() = user_id);

-- Helper to handle new user creation automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id, 
    new.email,
    -- Set superadmin/admin role if email matches
    case 
      when new.email = 'boreckyalex@gmail.com' then 'superadmin'
      when new.email = 'tester.bencheer@gmail.com' then 'admin'
      else 'user'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Index for better performance
create index if not exists idx_goals_user_id on public.goals(user_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_date on public.transactions(date);
create index if not exists idx_invitations_token on public.invitations(token);
create index if not exists idx_invitations_email on public.invitations(email);
