-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES Table (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  income_mode text not null default 'fixed' check (income_mode in ('fixed', 'hourly', 'manual')),
  income_amount numeric default 0,
  hourly_rate numeric default 0,
  hours_per_week numeric default 0,
  currency text default 'CZK',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- 2. GOALS Table
create table public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  target_amount numeric not null check (target_amount > 0),
  current_amount numeric default 0 check (current_amount >= 0),
  type text not null check (type in ('short-term', 'long-term')), -- short-term (Wants), long-term (Savings)
  deadline date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Goals
alter table public.goals enable row level security;
create policy "Users can CRUD own goals" on public.goals using (auth.uid() = user_id);

-- 3. TRANSACTIONS Table
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric not null check (amount > 0),
  category text not null check (category in ('need', 'want', 'saving')),
  description text,
  date date default CURRENT_DATE,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Transactions
alter table public.transactions enable row level security;
create policy "Users can CRUD own transactions" on public.transactions using (auth.uid() = user_id);

-- Helper to handle new user creation automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
