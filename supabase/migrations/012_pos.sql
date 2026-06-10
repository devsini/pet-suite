-- 012_pos.sql

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number varchar not null unique,
  customer_id uuid references customers(id) on delete set null,
  appointment_id uuid references appointments(id) on delete set null,
  inpatient_record_id uuid references inpatient_records(id) on delete set null,
  subtotal numeric(12,2) not null,
  discount_amount numeric(12,2) not null default 0,
  loyalty_points_used int not null default 0,
  total numeric(12,2) not null,
  payment_method payment_method_enum not null,
  payment_method_secondary payment_method_enum,
  paid_amount numeric(12,2) not null,
  change_amount numeric(12,2) not null default 0,
  status invoice_status_enum not null default 'pending',
  notes text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  item_type varchar not null,
  reference_id uuid,
  name text not null,
  quantity int not null,
  unit_price numeric(12,2) not null,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists refunds (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  amount numeric(12,2) not null,
  reason text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table refunds enable row level security;

create policy invoices_owner_full on invoices for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy invoices_staff_full on invoices for all using (auth.role() = 'staff') with check (auth.role() = 'staff');
create policy invoices_doctor_read on invoices for select using (auth.role() = 'doctor');
create policy invoices_customer_own on invoices for select using (customer_id = (select id from customers where profile_id = auth.uid()));

create policy invoice_items_owner_full on invoice_items for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy invoice_items_staff_read on invoice_items for select using (auth.role() = 'staff');
create policy invoice_items_doctor_read on invoice_items for select using (auth.role() = 'doctor');
create policy invoice_items_customer_none on invoice_items for select using (false);

create policy refunds_owner_full on refunds for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy refunds_staff_read on refunds for select using (auth.role() = 'staff');
create policy refunds_doctor_read on refunds for select using (auth.role() = 'doctor');
create policy refunds_customer_none on refunds for select using (false);
