-- 005_medical_records.sql

create table if not exists medical_records (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references appointments(id) on delete set null,
  pet_id uuid not null references pets(id) on delete cascade,
  doctor_id uuid not null references doctors(id) on delete set null,
  record_type medical_record_type_enum not null,
  subjective text,
  objective text,
  assessment text,
  plan text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists prescriptions (
  id uuid primary key default gen_random_uuid(),
  medical_record_id uuid not null references medical_records(id) on delete cascade,
  drug_name text not null,
  dose text not null,
  duration_days int not null,
  instruction text,
  created_at timestamptz not null default now()
);

create table if not exists medical_attachments (
  id uuid primary key default gen_random_uuid(),
  medical_record_id uuid not null references medical_records(id) on delete cascade,
  file_url text not null,
  file_type text not null,
  file_name text not null,
  uploaded_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table medical_records enable row level security;
alter table prescriptions enable row level security;
alter table medical_attachments enable row level security;

create policy medical_records_owner_full on medical_records for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy medical_records_doctor_full on medical_records for all using (auth.role() = 'doctor') with check (auth.role() = 'doctor');
create policy medical_records_staff_read on medical_records for select using (auth.role() = 'staff');
create policy medical_records_customer_own on medical_records for select using (pet_id in (select id from pets where customer_id = (select id from customers where profile_id = auth.uid())));

create policy prescriptions_owner_full on prescriptions for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy prescriptions_doctor_read on prescriptions for select using (auth.role() = 'doctor');
create policy prescriptions_staff_read on prescriptions for select using (auth.role() = 'staff');
create policy prescriptions_customer_none on prescriptions for select using (false);

create policy medical_attachments_owner_full on medical_attachments for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy medical_attachments_doctor_read on medical_attachments for select using (auth.role() = 'doctor');
create policy medical_attachments_staff_read on medical_attachments for select using (auth.role() = 'staff');
create policy medical_attachments_customer_none on medical_attachments for select using (false);
