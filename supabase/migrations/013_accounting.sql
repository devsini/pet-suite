-- 013_accounting.sql

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type account_type_enum not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  invoice_id uuid references invoices(id) on delete set null,
  type transaction_type_enum not null,
  amount numeric(12,2) not null,
  description text,
  reference text,
  transaction_date date not null default current_date,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table accounts enable row level security;
alter table transactions enable row level security;

create policy accounts_owner_full on accounts for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy accounts_staff_read on accounts for select using (auth.role() = 'staff');
create policy accounts_doctor_read on accounts for select using (auth.role() = 'doctor');
create policy accounts_customer_none on accounts for select using (false);

create policy transactions_owner_full on transactions for all using (auth.role() = 'owner') with check (auth.role() = 'owner');
create policy transactions_staff_read on transactions for select using (auth.role() = 'staff');
create policy transactions_doctor_read on transactions for select using (auth.role() = 'doctor');
create policy transactions_customer_none on transactions for select using (false);
