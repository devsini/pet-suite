-- 008_inpatient.sql

create table if not exists cages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cage_type text,
  status cage_status_enum not null default 'available',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists inpatient_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  cage_id uuid not null references cages(id) on delete restrict,
  admitting_doctor_id uuid not null references doctors(id) on delete set null,
  admit_date date not null,
  discharge_date date,
  reason text,
  notes text,
  status varchar not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists daily_observations (
  id uuid primary key default gen_random_uuid(),
  inpatient_record_id uuid not null references inpatient_records(id) on delete cascade,
  temperature numeric(5,2),
  appetite text,
  weight numeric(8,2),
  condition text,
  notes text,
  observed_by uuid references profiles(id) on delete set null,
  observed_at timestamptz not null default now()
);

create table if not exists inpatient_medication_schedules (
  id uuid primary key default gen_random_uuid(),
  inpatient_record_id uuid not null references inpatient_records(id) on delete cascade,
  drug_name text not null,
  dose text not null,
  schedule_time time not null,
  given_at timestamptz,
  given_by uuid references profiles(id) on delete set null,
  status varchar not null
);

alter table cages enable row level security;
alter table inpatient_records enable row level security;
alter table daily_observations enable row level security;
alter table inpatient_medication_schedules enable row level security;

create policy cages_owner_full on cages for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy cages_staff_read on cages for select using (auth.role() = 'staff');
create policy cages_doctor_read on cages for select using (auth.role() = 'doctor');
create policy cages_customer_none on cages for select using (false);

create policy inpatient_records_owner_full on inpatient_records for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy inpatient_records_staff_full on inpatient_records for all using (auth.role() = 'staff') with check (auth.role() = 'staff');
create policy inpatient_records_doctor_read on inpatient_records for select using (auth.role() = 'doctor');
create policy inpatient_records_customer_own on inpatient_records for select using (pet_id in (select id from pets where customer_id = (select id from customers where profile_id = auth.uid())));

create policy daily_observations_owner_full on daily_observations for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy daily_observations_staff_read on daily_observations for select using (auth.role() = 'staff');
create policy daily_observations_doctor_read on daily_observations for select using (auth.role() = 'doctor');
create policy daily_observations_customer_none on daily_observations for select using (false);

create policy inpatient_medication_schedules_owner_full on inpatient_medication_schedules for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy inpatient_medication_schedules_staff_read on inpatient_medication_schedules for select using (auth.role() = 'staff');
create policy inpatient_medication_schedules_doctor_read on inpatient_medication_schedules for select using (auth.role() = 'doctor');
create policy inpatient_medication_schedules_customer_none on inpatient_medication_schedules for select using (false);
