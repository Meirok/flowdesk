-- FlowDesk Initial Database Schema
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- COLUMNS (Kanban)
-- ─────────────────────────────────────────
create table if not exists columns (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  position integer not null default 0,
  color text,
  created_at timestamptz default now() not null
);

alter table columns enable row level security;

create policy "Users can manage own columns"
  on columns for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- PRIORITY LABELS
-- ─────────────────────────────────────────
create table if not exists priority_labels (
  id uuid default uuid_generate_v4() primary key,
  column_id uuid references columns on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  text text not null,
  bg_color text not null default '#a855f7',
  position integer not null default 0
);

alter table priority_labels enable row level security;

create policy "Users can manage own priority_labels"
  on priority_labels for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- CLIENTS
-- ─────────────────────────────────────────
create table if not exists clients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz default now() not null
);

alter table clients enable row level security;

create policy "Users can manage own clients"
  on clients for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- TASKS
-- ─────────────────────────────────────────
create table if not exists tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  column_id uuid references columns on delete cascade not null,
  title text not null,
  description text,
  client_id uuid references clients on delete set null,
  client_name text,
  amount numeric(12,2),
  due_date date,
  color_tag text check (color_tag in ('red','yellow','green','blue','purple')),
  position integer not null default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table tasks enable row level security;

create policy "Users can manage own tasks"
  on tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on tasks
  for each row execute procedure public.update_updated_at();

-- ─────────────────────────────────────────
-- INCOME
-- ─────────────────────────────────────────
create table if not exists income (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  client_id uuid references clients on delete set null,
  task_id uuid references tasks on delete set null,
  description text not null,
  amount numeric(12,2) not null,
  date date not null default current_date,
  status text not null default 'Pendiente' check (status in ('Pagado','Pendiente','Parcial')),
  created_at timestamptz default now() not null
);

alter table income enable row level security;

create policy "Users can manage own income"
  on income for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- EXPENSES
-- ─────────────────────────────────────────
create table if not exists expenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  description text not null,
  category text not null check (category in ('Servicios','Equipamiento','Software','Impuestos','Marketing','Varios')),
  amount numeric(12,2) not null,
  date date not null default current_date,
  payment_method text not null check (payment_method in ('Efectivo','Transferencia','Débito','Crédito')),
  created_at timestamptz default now() not null
);

alter table expenses enable row level security;

create policy "Users can manage own expenses"
  on expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- CREDIT CARDS
-- ─────────────────────────────────────────
create table if not exists credit_cards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  bank text not null,
  closing_day integer not null check (closing_day between 1 and 31),
  due_day integer not null check (due_day between 1 and 31),
  created_at timestamptz default now() not null
);

alter table credit_cards enable row level security;

create policy "Users can manage own credit_cards"
  on credit_cards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- CARD PURCHASES
-- ─────────────────────────────────────────
create table if not exists card_purchases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  card_id uuid references credit_cards on delete cascade not null,
  merchant text not null,
  amount numeric(12,2) not null,
  installments integer not null default 1,
  date date not null default current_date,
  created_at timestamptz default now() not null
);

alter table card_purchases enable row level security;

create policy "Users can manage own card_purchases"
  on card_purchases for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- SEED DEFAULT COLUMNS (called per user via function)
-- ─────────────────────────────────────────
create or replace function public.seed_default_columns(p_user_id uuid)
returns void as $$
begin
  insert into public.columns (user_id, name, position, color) values
    (p_user_id, 'Por hacer', 0, null),
    (p_user_id, 'En proceso / Enviar', 1, null),
    (p_user_id, 'COBROS', 2, '#f59e0b'),
    (p_user_id, 'Entregado', 3, '#22c55e');
end;
$$ language plpgsql security definer;
