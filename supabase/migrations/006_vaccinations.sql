-- 006_vaccinations.sql

create table if not exists vaccines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  manufacturer text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists vaccination_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  vaccine_id uuid not null references vaccines(id) on delete restrict,
  doctor_id uuid not null references doctors(id) on delete set null,
  vaccinated_at timestamptz not null,
  next_due_date date,
  batch_number text,
  notes text,
  certificate_url text,
  created_at timestamptz not null default now()
);

create table if not exists vaccination_reminders (
  id uuid primary key default gen_random_uuid(),
  vaccination_record_id uuid not null references vaccination_records(id) on delete cascade,
  remind_at timestamptz not null,
  channel vaccination_channel_enum not null,
  status varchar not null,
  sent_at timestamptz
);

alter table vaccines enable row level security;
alter table vaccination_records enable row level security;
alter table vaccination_reminders enable row level security;

create policy vaccines_owner_full on vaccines for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy vaccines_staff_read on vaccines for select using (auth.role() = 'staff' or auth.role() = 'doctor');
create policy vaccines_customer_none on vaccines for select using (false);

create policy vaccination_records_owner_full on vaccination_records for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy vaccination_records_doctor_full on vaccination_records for all using (auth.role() = 'doctor') with check (auth.role() = 'doctor');
create policy vaccination_records_staff_read on vaccination_records for select using (auth.role() = 'staff');
create policy vaccination_records_customer_own on vaccination_records for select using (pet_id in (select id from pets where customer_id = (select id from customers where profile_id = auth.uid())));

create policy vaccination_reminders_owner_full on vaccination_reminders for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy vaccination_reminders_staff_read on vaccination_reminders for select using (auth.role() = 'staff');
create policy vaccination_reminders_doctor_read on vaccination_reminders for select using (auth.role() = 'doctor');
create policy vaccination_reminders_customer_none on vaccination_reminders for select using (false);
