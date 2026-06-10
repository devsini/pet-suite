-- 014_website.sql

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  excerpt text,
  cover_url text,
  author_id uuid references profiles(id) on delete set null,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  content text not null,
  rating int not null check (rating between 1 and 5),
  photo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists website_content (
  id uuid primary key default gen_random_uuid(),
  section_key varchar not null unique,
  content jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles(id) on delete set null
);

alter table articles enable row level security;
alter table testimonials enable row level security;
alter table website_content enable row level security;

create policy articles_owner_full on articles for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy articles_staff_read on articles for select using (auth.role() = 'staff');
create policy articles_doctor_read on articles for select using (auth.role() = 'doctor');
create policy articles_customer_none on articles for select using (false);

create policy testimonials_owner_full on testimonials for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy testimonials_staff_read on testimonials for select using (auth.role() = 'staff');
create policy testimonials_doctor_read on testimonials for select using (auth.role() = 'doctor');
create policy testimonials_customer_none on testimonials for select using (false);

create policy website_content_owner_full on website_content for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy website_content_staff_read on website_content for select using (auth.role() = 'staff');
create policy website_content_doctor_read on website_content for select using (auth.role() = 'doctor');
create policy website_content_customer_none on website_content for select using (false);
