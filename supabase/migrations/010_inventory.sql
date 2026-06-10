-- 010_inventory.sql

create table if not exists inventory_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  address text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid not null references inventory_categories(id) on delete restrict,
  unit text not null,
  min_stock int not null default 0,
  current_stock int not null default 0,
  price_per_unit numeric(12,2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists inventory_batches (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references inventory_items(id) on delete cascade,
  supplier_id uuid references suppliers(id) on delete set null,
  batch_number text not null,
  quantity int not null,
  expiry_date date,
  purchase_price numeric(12,2) not null,
  received_at timestamptz not null default now(),
  created_by uuid references profiles(id) on delete set null
);

create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references inventory_items(id) on delete cascade,
  batch_id uuid references inventory_batches(id) on delete set null,
  movement_type stock_movement_type_enum not null,
  quantity int not null,
  reference_type text,
  reference_id uuid,
  notes text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table inventory_categories enable row level security;
alter table suppliers enable row level security;
alter table inventory_items enable row level security;
alter table inventory_batches enable row level security;
alter table stock_movements enable row level security;

create policy inventory_categories_owner_full on inventory_categories for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy inventory_categories_staff_read on inventory_categories for select using (auth.role() = 'staff');
create policy inventory_categories_doctor_read on inventory_categories for select using (auth.role() = 'doctor');
create policy inventory_categories_customer_none on inventory_categories for select using (false);

create policy suppliers_owner_full on suppliers for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy suppliers_staff_read on suppliers for select using (auth.role() = 'staff');
create policy suppliers_doctor_read on suppliers for select using (auth.role() = 'doctor');
create policy suppliers_customer_none on suppliers for select using (false);

create policy inventory_items_owner_full on inventory_items for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy inventory_items_staff_full on inventory_items for all using (auth.role() = 'staff') with check (auth.role() = 'staff');
create policy inventory_items_doctor_read on inventory_items for select using (auth.role() = 'doctor');
create policy inventory_items_customer_none on inventory_items for select using (false);

create policy inventory_batches_owner_full on inventory_batches for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy inventory_batches_staff_read on inventory_batches for select using (auth.role() = 'staff');
create policy inventory_batches_doctor_read on inventory_batches for select using (auth.role() = 'doctor');
create policy inventory_batches_customer_none on inventory_batches for select using (false);

create policy stock_movements_owner_full on stock_movements for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy stock_movements_staff_full on stock_movements for all using (auth.role() = 'staff') with check (auth.role() = 'staff');
create policy stock_movements_doctor_read on stock_movements for select using (auth.role() = 'doctor');
create policy stock_movements_customer_none on stock_movements for select using (false);
