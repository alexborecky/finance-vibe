create table if not exists public.assets (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    name text not null,
    value numeric not null,
    category text not null check (category in ('property', 'investment', 'savings', 'vehicle', 'other')),
    interest_rate numeric,
    created_at timestamptz not null default now(),
    primary key (id)
);

alter table public.assets enable row level security;

create policy "Users can view their own assets"
    on public.assets for select
    using (auth.uid() = user_id);

create policy "Users can insert their own assets"
    on public.assets for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own assets"
    on public.assets for update
    using (auth.uid() = user_id);

create policy "Users can delete their own assets"
    on public.assets for delete
    using (auth.uid() = user_id);
