-- 009_grooming.sql

create table if not exists grooming_services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12,2) not null,
  duration_minutes int not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists grooming_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  service_id uuid not null references grooming_services(id) on delete restrict,
  groomer_id uuid references profiles(id) on delete set null,
  scheduled_at timestamptz not null,
  completed_at timestamptz,
  status varchar not null,
  notes text,
  photo_before_url text,
  photo_after_url text,
  created_at timestamptz not null default now()
);

alter table grooming_services enable row level security;
alter table grooming_records enable row level security;

create policy grooming_services_owner_full on grooming_services for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy grooming_services_staff_read on grooming_services for select using (auth.role() = 'staff');
create policy grooming_services_doctor_read on grooming_services for select using (auth.role() = 'doctor');
create policy grooming_services_customer_none on grooming_services for select using (false);

create policy grooming_records_owner_full on grooming_records for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy grooming_records_staff_full on grooming_records for all using (auth.role() = 'staff') with check (auth.role() = 'staff');
create policy grooming_records_doctor_read on grooming_records for select using (auth.role() = 'doctor');
create policy grooming_records_customer_own on grooming_records for select using (pet_id in (select id from pets where customer_id = (select id from customers where profile_id = auth.uid())));
