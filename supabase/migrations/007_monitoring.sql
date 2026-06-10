-- 007_monitoring.sql

create table if not exists weight_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  weight numeric(8,2) not null,
  recorded_at timestamptz not null default now(),
  recorded_by uuid references profiles(id) on delete set null,
  notes text
);

create table if not exists medication_schedules (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  medical_record_id uuid references medical_records(id) on delete set null,
  drug_name text not null,
  dose text not null,
  frequency text not null,
  start_date date not null,
  end_date date,
  instruction text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists medication_logs (
  id uuid primary key default gen_random_uuid(),
  medication_schedule_id uuid not null references medication_schedules(id) on delete cascade,
  taken_at timestamptz not null,
  status varchar not null,
  notes text,
  logged_by uuid references profiles(id) on delete set null
);

create table if not exists recovery_notes (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  medical_record_id uuid not null references medical_records(id) on delete cascade,
  note text not null,
  photo_url text,
  recorded_at timestamptz not null default now(),
  recorded_by uuid references profiles(id) on delete set null
);

create table if not exists owner_uploads (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  photo_url text not null,
  note text,
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table weight_records enable row level security;
alter table medication_schedules enable row level security;
alter table medication_logs enable row level security;
alter table recovery_notes enable row level security;
alter table owner_uploads enable row level security;

create policy weight_records_owner_full on weight_records for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy weight_records_staff_full on weight_records for all using (auth.role() = 'staff') with check (auth.role() = 'staff');
create policy weight_records_doctor_read on weight_records for select using (auth.role() = 'doctor');
create policy weight_records_customer_own on weight_records for select using (pet_id in (select id from pets where customer_id = (select id from customers where profile_id = auth.uid())));

create policy medication_schedules_owner_full on medication_schedules for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy medication_schedules_staff_full on medication_schedules for all using (auth.role() = 'staff') with check (auth.role() = 'staff');
create policy medication_schedules_doctor_read on medication_schedules for select using (auth.role() = 'doctor');
create policy medication_schedules_customer_none on medication_schedules for select using (false);

create policy medication_logs_owner_full on medication_logs for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy medication_logs_doctor_read on medication_logs for select using (auth.role() = 'doctor');
create policy medication_logs_staff_read on medication_logs for select using (auth.role() = 'staff');
create policy medication_logs_customer_none on medication_logs for select using (false);

create policy recovery_notes_owner_full on recovery_notes for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy recovery_notes_doctor_read on recovery_notes for select using (auth.role() = 'doctor');
create policy recovery_notes_staff_read on recovery_notes for select using (auth.role() = 'staff');
create policy recovery_notes_customer_none on recovery_notes for select using (false);

create policy owner_uploads_owner_full on owner_uploads for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy owner_uploads_customer_own on owner_uploads for select using (customer_id = (select id from customers where profile_id = auth.uid()));
create policy owner_uploads_staff_read on owner_uploads for select using (auth.role() = 'staff');
create policy owner_uploads_doctor_read on owner_uploads for select using (auth.role() = 'doctor');
