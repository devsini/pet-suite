-- 002_customers.sql

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  full_name text not null,
  whatsapp text,
  email text,
  address text,
  notes text,
  status customer_status_enum not null default 'active',
  loyalty_points int not null default 0,
  membership_tier text,
  registration_date date not null default current_date,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table customers enable row level security;

create policy customers_owner_full on customers for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy customers_staff_full on customers for all using (auth.role() = 'staff') with check (auth.role() = 'staff');
create policy customers_doctor_read on customers for select using (auth.role() = 'doctor');
create policy customers_customer_own on customers for select using (profile_id = auth.uid());
