-- seed.sql

insert into modules (id, key, is_enabled, updated_at) values
  (gen_random_uuid(), 'clinic', true, now()),
  (gen_random_uuid(), 'monitoring', true, now()),
  (gen_random_uuid(), 'inpatient', true, now()),
  (gen_random_uuid(), 'grooming', true, now()),
  (gen_random_uuid(), 'petshop', true, now()),
  (gen_random_uuid(), 'inventory', true, now()),
  (gen_random_uuid(), 'accounting', true, now()),
  (gen_random_uuid(), 'website', true, now())
on conflict (key) do update set is_enabled = excluded.is_enabled, updated_at = excluded.updated_at;

insert into settings (id, key, value, updated_at) values
  (gen_random_uuid(), 'whatsapp_config', '{}'::jsonb, now()),
  (gen_random_uuid(), 'smtp_config', '{}'::jsonb, now()),
  (gen_random_uuid(), 'service_provider', '{}'::jsonb, now())
on conflict (key) do update set value = excluded.value, updated_at = excluded.updated_at;

insert into accounts (id, name, type, description, is_active, created_at) values
  (gen_random_uuid(), 'Cash', 'asset', 'Primary cash account', true, now()),
  (gen_random_uuid(), 'Sales Revenue', 'revenue', 'Revenue from sales', true, now()),
  (gen_random_uuid(), 'Inventory', 'asset', 'Inventory asset account', true, now())
on conflict (name) do nothing;

insert into product_categories (id, name, slug, created_at) values
  (gen_random_uuid(), 'Food', 'food', now()),
  (gen_random_uuid(), 'Accessories', 'accessories', now())
on conflict (slug) do nothing;

insert into brands (id, name, created_at) values
  (gen_random_uuid(), 'PetCare Basics', now()),
  (gen_random_uuid(), 'ClinicChoice', now())
on conflict (name) do nothing;

insert into species (id, name, created_at) values
  (gen_random_uuid(), 'Dog', now()),
  (gen_random_uuid(), 'Cat', now())
on conflict (name) do nothing;

insert into breeds (id, species_id, name, created_at)
select gen_random_uuid(), s.id, 'Mixed', now()
from species s
where s.name = 'Dog'
on conflict on constraint breeds_species_id_name_key do nothing;

insert into breeds (id, species_id, name, created_at)
select gen_random_uuid(), s.id, 'Mixed', now()
from species s
where s.name = 'Cat'
on conflict on constraint breeds_species_id_name_key do nothing;
