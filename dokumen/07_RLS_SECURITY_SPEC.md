PETCARE SUITE

07_RLS_SECURITY_SPEC.md

Version 3.0

Single Source of Truth (SSOT)

Production Security Architecture


---

1. SECURITY PRINCIPLES

PetCare Suite menggunakan:

Supabase Auth
+
PostgreSQL RLS
+
JWT Validation
+
Storage Policy
+
Application Guards

Security Layer:

Layer 1  → Authentication
Layer 2  → Route Authorization
Layer 3  → Row Level Security
Layer 4  → Storage Policies
Layer 5  → Edge Function Validation
Layer 6  → Audit Logging


---

2. GOLDEN RULE

DILARANG

auth.role() = 'owner'

Karena Supabase mengembalikan:

authenticated
anon
service_role

Bukan role aplikasi.


---

WAJIB

exists (
  select 1
  from profiles p
  where p.id = auth.uid()
  and p.role = 'owner'
)


---

3. REUSABLE SECURITY FUNCTIONS


---

is_owner()

create or replace function is_owner()
returns boolean
language sql
stable
as
$$
select exists (
  select 1
  from profiles
  where id = auth.uid()
  and role = 'owner'
);
$$;


---

is_doctor()

create or replace function is_doctor()
returns boolean
language sql
stable
as
$$
select exists (
  select 1
  from profiles
  where id = auth.uid()
  and role = 'doctor'
);
$$;


---

is_staff()

create or replace function is_staff()
returns boolean
language sql
stable
as
$$
select exists (
  select 1
  from profiles
  where id = auth.uid()
  and role = 'staff'
);
$$;


---

is_customer()

create or replace function is_customer()
returns boolean
language sql
stable
as
$$
select exists (
  select 1
  from profiles
  where id = auth.uid()
  and role = 'customer'
);
$$;


---

4. CUSTOMER OWNERSHIP FUNCTION

Digunakan hampir di seluruh portal customer.

create or replace function customer_id_from_auth()
returns uuid
language sql
stable
as
$$
select c.id
from customers c
where c.profile_id = auth.uid()
limit 1;
$$;


---

5. PET OWNERSHIP FUNCTION

create or replace function pet_belongs_to_customer(
  target_pet uuid
)
returns boolean
language sql
stable
as
$$
select exists (

  select 1

  from pets p

  where p.id = target_pet

  and p.customer_id =
  customer_id_from_auth()

);
$$;


---

6. ENABLE RLS

WAJIB pada seluruh tabel.

Contoh:

alter table profiles enable row level security;
alter table customers enable row level security;
alter table pets enable row level security;
alter table appointments enable row level security;

Semua tabel.

Tidak boleh ada tabel bisnis tanpa RLS.


---

7. PROFILES POLICY


---

Owner Full Access

create policy profiles_owner_all
on profiles
for all
using (
  is_owner()
);


---

Self Read

create policy profiles_self_select
on profiles
for select
using (
  auth.uid() = id
);


---

Self Update

create policy profiles_self_update
on profiles
for update
using (
  auth.uid() = id
);


---

8. SETTINGS POLICY

Settings berisi:

SMTP
WhatsApp API
Business Config
Modules

Harus Owner Only.


---

Owner Full Access

create policy settings_owner
on settings
for all
using (
  is_owner()
);


---

Semua role lain:

NO ACCESS


---

9. MODULES POLICY


---

Read

create policy modules_read
on modules
for select
using (
  auth.role() = 'authenticated'
);


---

Owner Manage

create policy modules_owner_manage
on modules
for all
using (
  is_owner()
);


---

10. CUSTOMERS POLICY


---

Owner

create policy customers_owner
on customers
for all
using (
  is_owner()
);


---

Staff

create policy customers_staff
on customers
for all
using (
  is_staff()
);


---

Doctor Read

create policy customers_doctor_read
on customers
for select
using (
  is_doctor()
);


---

Customer Own Record

create policy customers_self
on customers
for select
using (
  profile_id = auth.uid()
);


---

11. PETS POLICY


---

Owner

create policy pets_owner
on pets
for all
using (
  is_owner()
);


---

Staff

create policy pets_staff
on pets
for all
using (
  is_staff()
);


---

Doctor Read

create policy pets_doctor
on pets
for select
using (
  is_doctor()
);


---

Customer Own Pets

create policy pets_customer
on pets
for select
using (
  customer_id =
  customer_id_from_auth()
);


---

12. APPOINTMENTS POLICY


---

Owner

create policy appointments_owner
on appointments
for all
using (
  is_owner()
);


---

Staff

create policy appointments_staff
on appointments
for all
using (
  is_staff()
);


---

Doctor

create policy appointments_doctor
on appointments
for all
using (
  is_doctor()
);


---

Customer

create policy appointments_customer
on appointments
for select
using (

customer_id =
customer_id_from_auth()

);


---

13. MEDICAL RECORD POLICY

Clinical Data


---

Owner

create policy medical_owner
on medical_records
for all
using (
  is_owner()
);


---

Doctor

create policy medical_doctor
on medical_records
for all
using (
  is_doctor()
);


---

Staff Read

create policy medical_staff
on medical_records
for select
using (
  is_staff()
);


---

Customer Own Pet

create policy medical_customer
on medical_records
for select
using (

pet_id in (

select id
from pets
where customer_id =
customer_id_from_auth()

)

);


---

14. VACCINATION POLICY

Sama dengan Medical Record.


---

15. MONITORING POLICY

Sama dengan Medical Record.

Termasuk:

weight_records
medication_schedules
medication_logs
recovery_notes
owner_uploads


---

16. INPATIENT POLICY


---

Owner

ALL


---

Staff

ALL


---

Doctor

SELECT


---

Customer

SELECT own pet only


---

17. GROOMING POLICY


---

Owner

ALL

Staff

ALL

Doctor

SELECT

Customer

SELECT own pet


---

18. INVENTORY POLICY

Inventory adalah data internal.

Customer tidak boleh melihat.


---

Owner

ALL


---

Staff

ALL


---

Doctor

SELECT


---

Customer

NONE


---

19. PETSHOP POLICY


---

Owner

ALL


---

Staff

ALL


---

Doctor

SELECT


---

Customer

SELECT active products

Jika portal e-commerce diaktifkan.


---

20. INVOICE POLICY


---

Owner

ALL


---

Staff

ALL


---

Doctor

SELECT


---

Customer

SELECT
WHERE customer_id =
customer_id_from_auth()


---

21. ACCOUNTING POLICY

Sangat sensitif.


---

Owner

ALL


---

Staff

SELECT


---

Doctor

NONE


---

Customer

NONE


---

22. AUDIT LOG POLICY

Audit Log tidak boleh dimanipulasi.


---

Owner

SELECT


---

Insert

SYSTEM ONLY


---

Update

DENY


---

Delete

DENY


---

23. NOTIFICATION LOG POLICY


---

Owner

ALL


---

Staff

SELECT


---

Customer

SELECT own notification


---

24. STORAGE POLICIES

pet-photos

Owner

Read Write

Staff

Read Write

Doctor

Read

Customer

Read Own


---

medical-files

Owner

Full

Doctor

Full

Staff

Read

Customer

Read Own


---

vaccination-certificates

Owner

Full

Doctor

Full

Staff

Read

Customer

Read Own


---

invoices

Owner

Full

Staff

Full

Customer

Read Own


---

25. AUTH GUARD RULES

Frontend wajib:

if (!session)
  redirect("/login")


---

Dan:

if (!user.isActive)
  logout()


---

Wajib setiap refresh.


---

26. ROLE GUARD RULES

allowedRoles.includes(user.role)

Jika gagal:

redirect("/403")


---

27. MODULE GUARD RULES

Contoh:

inventory = false

Maka:

/staff/inventory

langsung:

redirect("/403")


---

28. EDGE FUNCTION SECURITY

Semua Edge Function wajib:

Reject Non POST

if(req.method !== "POST")

Return:

405


---

Verify JWT

Authorization:
Bearer token

Wajib diverifikasi.


---

Verify User Active

profiles.is_active

Jika false:

403


---

Verify Role

Contoh:

generate-pdf

Tidak boleh diakses customer untuk invoice milik orang lain.


---

29. AUDIT LOGGING RULES

WAJIB dicatat:

LOGIN
LOGOUT

CREATE
UPDATE
DELETE

PAYMENT

REFUND

MODULE_CHANGE

SETTINGS_CHANGE

USER_DISABLE

USER_ENABLE


---

30. SECURITY HEADERS

Vercel Middleware

Wajib:

X-Frame-Options: DENY

X-Content-Type-Options: nosniff

Referrer-Policy:
strict-origin

Permissions-Policy:
camera=(),
microphone=()


---

31. RATE LIMITING

Login:

5 request / menit


---

Forgot Password:

3 request / 15 menit


---

Send WhatsApp:

30 request / menit


---

Send Email:

30 request / menit


---

32. OWASP CHECKLIST

WAJIB LOLOS

A01 Broken Access Control
A02 Cryptographic Failure
A03 Injection
A04 Insecure Design
A05 Security Misconfiguration
A06 Vulnerable Components
A07 Authentication Failures
A08 Software Integrity
A09 Logging Failures
A10 SSRF


---

33. PRODUCTION GO LIVE CHECKLIST

Database

[ ] Semua tabel RLS enabled

[ ] Semua policy aktif

[ ] Service role tidak bocor


Storage

[ ] Semua bucket policy aktif

[ ] Public bucket hanya website


Auth

[ ] Owner pertama dibuat

[ ] is_active enforcement aktif


Edge Functions

[ ] JWT verification aktif

[ ] Error logging aktif


Frontend

[ ] RoleGuard aktif

[ ] ModuleGuard aktif

[ ] ErrorBoundary aktif


Monitoring

[ ] Audit log aktif

[ ] Notification log aktif

[ ] Backup aktif



---

END OF 

