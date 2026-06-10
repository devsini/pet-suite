-- 004_appointments.sql

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes int not null,
  price numeric(12,2) not null,
  category text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists doctors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  specialization text,
  bio text,
  photo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists doctor_schedules (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references doctors(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_available boolean not null default true
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  pet_id uuid not null references pets(id) on delete cascade,
  doctor_id uuid not null references doctors(id) on delete set null,
  service_id uuid not null references services(id) on delete restrict,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  status appointment_status_enum not null default 'scheduled',
  queue_number int,
  notes text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table services enable row level security;
alter table doctors enable row level security;
alter table doctor_schedules enable row level security;
alter table appointments enable row level security;

create policy services_owner_full on services for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy services_staff_read on services for select using (auth.role() = 'staff');
create policy services_doctor_read on services for select using (auth.role() = 'doctor');
create policy services_customer_none on services for select using (false);

create policy doctors_owner_full on doctors for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy doctors_staff_read on doctors for select using (auth.role() = 'staff');
create policy doctors_doctor_read on doctors for select using (auth.role() = 'doctor');
create policy doctors_customer_none on doctors for select using (false);

create policy doctor_schedules_owner_full on doctor_schedules for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy doctor_schedules_staff_read on doctor_schedules for select using (auth.role() = 'staff');
create policy doctor_schedules_doctor_read on doctor_schedules for select using (auth.role() = 'doctor');
create policy doctor_schedules_customer_none on doctor_schedules for select using (false);

create policy appointments_owner_full on appointments for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy appointments_staff_full on appointments for all using (auth.role() = 'staff') with check (auth.role() = 'staff');
create policy appointments_doctor_read on appointments for select using (auth.role() = 'doctor');
create policy appointments_customer_own on appointments for select using (customer_id = (select id from customers where profile_id = auth.uid()));
