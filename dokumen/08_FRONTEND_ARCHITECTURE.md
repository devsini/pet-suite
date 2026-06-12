PETCARE SUITE

08_FRONTEND_ARCHITECTURE.md

Version 3.0

Single Source of Truth (SSOT)

Frontend Engineering Specification


---

1. OBJECTIVE

Dokumen ini mendefinisikan standar frontend yang WAJIB digunakan selama pengembangan PetCare Suite.

Tujuan:

Predictable
Scalable
Maintainable
Testable
Production Ready

Semua developer wajib mengikuti dokumen ini.


---

2. TECH STACK (FIXED)

Framework:
  React 18

Language:
  TypeScript 5

Bundler:
  Vite 5

UI:
  shadcn/ui
  Radix UI

Styling:
  Tailwind CSS 3

Routing:
  React Router v6

State:
  Zustand

Server State:
  TanStack Query v5

Forms:
  React Hook Form

Validation:
  Zod

Charts:
  Recharts

Icons:
  Lucide React

Tidak boleh diganti tanpa revisi SSOT.


---

3. PROJECT STRUCTURE

src/

├── app/
│
├── router/
│
├── pages/
│
├── features/
│
├── components/
│
├── hooks/
│
├── stores/
│
├── lib/
│
├── types/
│
├── styles/
│
└── assets/


---

4. APP FOLDER

src/app

Berisi:

App.tsx
Providers.tsx
ErrorBoundary.tsx


---

Contoh:

app/
 ├── App.tsx
 ├── Providers.tsx
 └── ErrorBoundary.tsx


---

5. ROUTER STRUCTURE

router/

├── index.tsx
├── routes.ts
├── route-config.ts
├── guards/
│
├── AuthGuard.tsx
├── RoleGuard.tsx
└── ModuleGuard.tsx


---

6. ROUTE TREE

/

├── login
├── forgot-password
├── reset-password

├── dashboard

├── profile

├── staff
│
├── customers
├── pets
├── appointments
├── grooming
├── inpatient
├── petshop
├── inventory
├── pos
├── invoices
├── accounting
├── notifications
├── settings

├── doctor
│
├── medical-records
├── vaccinations
├── monitoring

├── portal
│
├── pets
├── appointments
├── invoices
├── notifications
├── profile

└── public


---

7. FEATURE FIRST ARCHITECTURE

WAJIB.

Tidak boleh:

components/customer
components/pet
components/appointment

Model lama akan rusak ketika project besar.


---

Gunakan:

features/


---

8. FEATURE STRUCTURE

Contoh Customer Module

features/customers

├── pages/
│
├── components/
│
├── customers.service.ts
│
├── customers.hooks.ts
│
├── customers.types.ts
│
├── customers.schema.ts
│
├── index.ts
│
└── __tests__/


---

9. PAGE RULES

Page hanya:

Layout
Composition
Hook Calls


---

Tidak boleh:

Supabase Query
Business Logic


---

SALAH

const { data } = await supabase...

di page.


---

BENAR

const { data } = useCustomers()


---

10. SERVICE RULES

Semua query database berada di:

*.service.ts


---

Contoh

customers.service.ts


---

Semua:

select
insert
update
delete
rpc
storage

harus berada di sini.


---

11. HOOK RULES

Semua TanStack Query berada di:

*.hooks.ts


---

Contoh

export function useCustomers() {}


---

export function useCreateCustomer() {}


---

Tidak boleh query langsung di page.


---

12. TYPE RULES

Setiap module punya:

customers.types.ts


---

Contoh

export interface Customer {}

export interface CustomerForm {}

export interface CustomerFilter {}


---

13. ZOD RULES

Setiap form wajib punya schema.


---

Contoh

customer.schema.ts


---

export const customerSchema =
z.object({
  full_name: z.string(),
  whatsapp: z.string()
})


---

Tidak boleh validasi manual.


---

14. COMPONENT HIERARCHY

Global Components

components/common


---

Layout Components

components/layout


---

UI Components

components/ui


---

Feature Components

features/*/components


---

15. COMMON COMPONENTS

WAJIB ADA

PageHeader
DataTable
PageSkeleton
ErrorBoundary
FileUpload
ConfirmDialog
EmptyState


---

16. PAGE HEADER STANDARD

Semua halaman menggunakan:

<PageHeader
 title=""
 description=""
 actions={}
/>


---

Tidak boleh custom title per halaman.


---

17. DATATABLE STANDARD

Semua tabel menggunakan:

TanStack Table


---

Fitur wajib:

Sorting
Pagination
Search
Column Visibility
Export CSV


---

18. FORM STANDARD

Semua form:

React Hook Form
+
Zod


---

Tidak boleh:

useState form besar


---

19. FORM LAYOUT STANDARD

Desktop:

2 Column


---

Mobile:

1 Column


---

Field order:

Primary Data
Secondary Data
Advanced Data


---

20. DIALOG STANDARD

Create:

Modal


---

Edit:

Drawer


---

Delete:

Confirmation Dialog


---

21. LOADING STANDARD

DILARANG:

Spinner Page


---

WAJIB:

Skeleton


---

Contoh:

<PageSkeleton />


---

22. ERROR HANDLING STANDARD

Semua page:

<ErrorBoundary>
  <Page />
</ErrorBoundary>


---

23. EMPTY STATE STANDARD

Wajib.


---

Contoh:

<EmptyState
 icon={Users}
 title="Belum ada customer"
/>


---

24. TOAST STANDARD

Semua aksi:

Create
Update
Delete
Success
Error

WAJIB toast.


---

25. ZUSTAND STORES

auth.store

user
role
session

setUser()
setSession()

logout()


---

module.store

modules

fetchModules()


---

ui.store

theme

sidebarCollapsed


---

cart.store

cart
paymentData
totals


---

26. QUERY KEY STANDARD

Format:

['customers']

['customers', page]

['appointments', filters]

['pets', customerId]


---

Tidak boleh:

['data']


---

27. QUERY INVALIDATION

Setelah mutasi:

queryClient.invalidateQueries()


---

Contoh:

invalidateQueries({
 queryKey: ['customers']
})


---

28. FILE UPLOAD STANDARD

Semua upload:

Supabase Storage

melalui:

<FileUpload />


---

Tidak boleh upload langsung dari page.


---

29. DOCUMENT TITLE

Semua halaman:

useDocumentTitle()


---

Contoh:

useDocumentTitle(
 'Customers'
)


---

30. RESPONSIVE BREAKPOINTS

sm 640
md 768
lg 1024
xl 1280
2xl 1536

Default Tailwind.


---

31. DARK MODE

Support:

Light
Dark


---

Menggunakan:

class strategy


---

32. SIDEBAR STANDARD

Desktop:

Fixed Sidebar


---

Tablet:

Collapsible


---

Mobile:

Drawer


---

33. PERFORMANCE RULES

Semua page:

Lazy Loaded


---

const CustomersPage =
lazy(...)


---

34. CHART STANDARD

Library:

Recharts


---

Jenis:

Line
Bar
Pie
Area


---

Tidak boleh Chart.js.


---

35. EXPORT STANDARD

Semua report:

CSV
PDF


---

PDF melalui Edge Function.


---

36. ACCESSIBILITY

Minimal:

Keyboard Navigation

Focus State

Aria Labels

Dialog Accessibility


---

WAJIB untuk shadcn defaults.


---

37. TEST COVERAGE TARGET

Frontend:

80%

minimum.


---

Critical:

Cart Store
POS
Payment
Invoice
Medical Record

harus 90%+.


---

38. CODING STANDARDS

Max:

300 lines/component


---

Jika lebih:

Split component


---

Max:

500 lines/page


---

Jika lebih:

Refactor


---

39. LOC ESTIMATION

Module	LOC

Auth	2.000
Dashboard	3.000
Customers	4.000
Pets	4.500
Appointments	5.000
Medical Records	7.000
Vaccinations	3.000
Monitoring	4.000
Inpatient	5.000
Grooming	3.000
Inventory	5.000
Petshop	4.500
POS	8.000
Accounting	4.000
Reports	4.000
Notifications	2.500
Website CMS	3.500
Customer Portal	6.000



---

Total Frontend

±75.000 – 90.000 LOC


---

40. FRONTEND ACCEPTANCE CRITERIA

Aplikasi dianggap selesai jika:

Semua route berjalan

Semua role berjalan

Semua module guard berjalan

Semua CRUD berjalan

Semua form tervalidasi

Semua page responsive

Semua upload berjalan

Semua PDF berjalan

Semua notification berjalan

Tidak ada console error

Lighthouse ≥ 85

TypeScript strict = PASS

Build production = PASS



---

END OF 

