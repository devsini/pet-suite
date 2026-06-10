-- 003_pets.sql

create table if not exists species (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists breeds (
  id uuid primary key default gen_random_uuid(),
  species_id uuid not null references species(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique(species_id, name)
);

create table if not exists pets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  name text not null,
  photo_url text,
  species_id uuid not null references species(id) on delete restrict,
  breed_id uuid not null references breeds(id) on delete restrict,
  gender varchar not null,
  birth_date date,
  weight numeric(8,2),
  color text,
  is_sterilized boolean not null default false,
  microchip_number text,
  qr_code text unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table species enable row level security;
alter table breeds enable row level security;
alter table pets enable row level security;

create policy species_owner_full on species for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy species_staff_read on species for select using (auth.role() = 'staff' or auth.role() = 'doctor');
create policy species_customer_none on species for select using (false);

create policy breeds_owner_full on breeds for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy breeds_staff_read on breeds for select using (auth.role() = 'staff' or auth.role() = 'doctor');
create policy breeds_customer_none on breeds for select using (false);

create policy pets_owner_full on pets for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy pets_staff_full on pets for all using (auth.role() = 'staff') with check (auth.role() = 'staff');
create policy pets_doctor_read on pets for select using (auth.role() = 'doctor');
create policy pets_customer_own on pets for select using (customer_id = (select id from customers where profile_id = auth.uid()));
