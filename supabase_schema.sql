create extension if not exists "pgcrypto";

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text,
  created_at timestamptz not null default now()
);

create table if not exists public.clips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  text text not null,
  page text,
  note text,
  tags text,
  created_at timestamptz not null default now()
);

alter table public.books enable row level security;
alter table public.clips enable row level security;

drop policy if exists "Users can select own books" on public.books;
drop policy if exists "Users can insert own books" on public.books;
drop policy if exists "Users can update own books" on public.books;
drop policy if exists "Users can delete own books" on public.books;

create policy "Users can select own books" on public.books for select using (auth.uid() = user_id);
create policy "Users can insert own books" on public.books for insert with check (auth.uid() = user_id);
create policy "Users can update own books" on public.books for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own books" on public.books for delete using (auth.uid() = user_id);

drop policy if exists "Users can select own clips" on public.clips;
drop policy if exists "Users can insert own clips" on public.clips;
drop policy if exists "Users can update own clips" on public.clips;
drop policy if exists "Users can delete own clips" on public.clips;

create policy "Users can select own clips" on public.clips for select using (auth.uid() = user_id);
create policy "Users can insert own clips" on public.clips for insert with check (auth.uid() = user_id);
create policy "Users can update own clips" on public.clips for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own clips" on public.clips for delete using (auth.uid() = user_id);
