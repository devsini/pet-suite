-- 011_petshop.sql

create table if not exists product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category_id uuid not null references product_categories(id) on delete restrict,
  brand_id uuid not null references brands(id) on delete restrict,
  sku text not null unique,
  barcode text,
  base_price numeric(12,2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  size text,
  weight numeric(8,2),
  color text,
  price numeric(12,2) not null,
  stock int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  is_primary boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table product_categories enable row level security;
alter table brands enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;

create policy product_categories_owner_full on product_categories for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy product_categories_staff_read on product_categories for select using (auth.role() = 'staff');
create policy product_categories_doctor_read on product_categories for select using (auth.role() = 'doctor');
create policy product_categories_customer_none on product_categories for select using (false);

create policy brands_owner_full on brands for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy brands_staff_read on brands for select using (auth.role() = 'staff');
create policy brands_doctor_read on brands for select using (auth.role() = 'doctor');
create policy brands_customer_none on brands for select using (false);

create policy products_owner_full on products for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy products_staff_full on products for all using (auth.role() = 'staff') with check (auth.role() = 'staff');
create policy products_doctor_read on products for select using (auth.role() = 'doctor');
create policy products_customer_none on products for select using (false);

create policy product_variants_owner_full on product_variants for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy product_variants_staff_read on product_variants for select using (auth.role() = 'staff');
create policy product_variants_doctor_read on product_variants for select using (auth.role() = 'doctor');
create policy product_variants_customer_none on product_variants for select using (false);

create policy product_images_owner_full on product_images for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy product_images_staff_read on product_images for select using (auth.role() = 'staff');
create policy product_images_doctor_read on product_images for select using (auth.role() = 'doctor');
create policy product_images_customer_none on product_images for select using (false);
