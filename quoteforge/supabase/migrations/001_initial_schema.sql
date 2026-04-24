-- ============================================================
-- QuoteForge — Initial Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Profiles ─────────────────────────────────────────────────
-- Auto-created when a user signs up via trigger below
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  company_name  text,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger: create profile row on new user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, company_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'company_name'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Quote status enum ─────────────────────────────────────────
do $$ begin
  create type quote_status as enum ('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired');
exception
  when duplicate_object then null;
end $$;

-- ── Quotes ───────────────────────────────────────────────────
create table if not exists public.quotes (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  title         text not null,
  client_name   text not null,
  client_email  text not null,
  currency      char(3) not null default 'USD',
  total_amount  numeric(12, 2) not null default 0,
  status        quote_status not null default 'draft',
  notes         text,
  valid_until   timestamptz,
  sent_at       timestamptz,
  viewed_at     timestamptz,
  accepted_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.quotes enable row level security;

create policy "Users can CRUD own quotes"
  on public.quotes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Line Items ───────────────────────────────────────────────
create table if not exists public.line_items (
  id            uuid primary key default uuid_generate_v4(),
  quote_id      uuid not null references public.quotes(id) on delete cascade,
  description   text not null,
  quantity      numeric(10, 2) not null default 1,
  unit_price    numeric(12, 2) not null default 0,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.line_items enable row level security;

-- Line items inherit access from their parent quote
create policy "Users can CRUD own line items"
  on public.line_items for all
  using (
    exists (
      select 1 from public.quotes
      where quotes.id = line_items.quote_id
      and quotes.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.quotes
      where quotes.id = line_items.quote_id
      and quotes.user_id = auth.uid()
    )
  );

-- ── Quote Views (tracking) ───────────────────────────────────
create table if not exists public.quote_views (
  id            uuid primary key default uuid_generate_v4(),
  quote_id      uuid not null references public.quotes(id) on delete cascade,
  viewed_at     timestamptz not null default now(),
  ip_address    text,
  user_agent    text
);

alter table public.quote_views enable row level security;

-- Quote owner can see view tracking; public can insert (no auth needed for client views)
create policy "Owners can view tracking data"
  on public.quote_views for select
  using (
    exists (
      select 1 from public.quotes
      where quotes.id = quote_views.quote_id
      and quotes.user_id = auth.uid()
    )
  );

create policy "Anyone can record a view"
  on public.quote_views for insert
  with check (true);

-- ── Updated_at trigger ────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger set_quotes_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

create or replace trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists idx_quotes_user_id     on public.quotes(user_id);
create index if not exists idx_quotes_status      on public.quotes(status);
create index if not exists idx_quotes_client_email on public.quotes(client_email);
create index if not exists idx_line_items_quote_id on public.line_items(quote_id);
create index if not exists idx_quote_views_quote_id on public.quote_views(quote_id);
