# PetCare Suite
## Integrated Veterinary Clinic & Petshop Management System
### Version: 2.0 Final Specification

---

## 1. PRODUCT OVERVIEW

PetCare Suite adalah platform manajemen klinik hewan dan petshop terintegrasi
untuk satu klinik, mencakup rekam medis, appointment, monitoring kesehatan
hewan, rawat inap, inventori, POS, keuangan, dan hubungan pelanggan dalam
satu sistem modular.

---

## 2. TECH STACK

Frontend     : React + TypeScript + Vite
UI Library   : shadcn/ui + Tailwind CSS
State        : TanStack Query + Zustand
Backend      : Supabase (Auth + Database + Storage + Realtime)
Functions    : Supabase Edge Functions
Deployment   : Vercel (frontend) + Supabase Cloud
Notifikasi   : WhatsApp (Fonnte / Wablas) + Email (SMTP)

---

## 3. DEPLOYMENT & SETUP

### Target Environment
- Vercel (frontend hosting, free tier)
- Supabase Cloud (backend, free tier)
- Domain custom opsional

### Development Setup
- Clone repo
- Copy .env.example ke .env
- Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY
- npm install
- npm run dev

### Production Deploy
- Push ke GitHub → Vercel auto deploy
- Supabase migration via CLI: supabase db push
- Seed data awal via Supabase dashboard atau CLI

### Semua konfigurasi operasional (WhatsApp, Email, Profil Klinik)
dilakukan dari dalam dashboard Owner — tidak ada config di file .env
selain kredensial Supabase.

---

## 4. DESIGN SYSTEM

### Prinsip UI/UX
- Modern, clean, profesional
- Dark mode + Light mode
- Fully responsive: Desktop, Tablet, Mobile
- Interaktif: animasi transisi halus, skeleton loading, toast notification
- Dashboard berbasis card dan chart
- Sidebar collapsible
- Command palette (Cmd+K) untuk navigasi cepat

### Komponen Global
- Global Search
- Notification Dropdown (realtime)
- Activity Feed
- Quick Actions floating button
- Breadcrumb
- Theme Switcher (dark/light)
- Module Status Indicator
- User Profile Menu
- Skeleton Loading di semua list dan detail page
- Empty State illustration di semua halaman kosong
- Confirmation Dialog untuk semua aksi destructive

---

## 5. USER ROLES

### Owner
Akses penuh ke seluruh sistem termasuk settings, modul, laporan keuangan,
dan konfigurasi integrasi.

### Doctor
Akses ke seluruh data medis: rekam medis, appointment, vaksinasi,
monitoring, rawat inap.

### Staff
Akses operasional: customer, pet registration, appointment, POS,
inventory, grooming, rawat inap.

### Customer
Akses portal pribadi: data hewan milik sendiri, booking, monitoring,
invoice, notifikasi.

---

## 6. CORE MODULE (Mandatory, tidak dapat dinonaktifkan)

### Authentication
- Login
- Logout
- Forgot Password
- Reset Password via email

### Authorization
- Role Based Access Control (RBAC)
- Row Level Security (RLS) di Supabase per role
- Permission granular per fitur

### User Management
- CRUD user
- Assign role
- Aktif / nonaktif user

### Notification Center
- Realtime via Supabase Realtime
- Log semua notifikasi terkirim/gagal

### Activity Log / Audit Trail
- Mencatat: Login, Logout, Create, Update, Delete
- Menampilkan: user, aksi, waktu, IP address

---

## 7. MODULE TOGGLE SYSTEM

Owner dapat enable/disable modul tanpa restart sistem.
Status modul disimpan di tabel settings di database.

Modul yang dapat di-toggle:
- Clinic Module
- Monitoring Module
- Inpatient Module
- Grooming Module
- Petshop Module
- Inventory Module
- Accounting Module
- Website Module

---

## 8. CUSTOMER MANAGEMENT MODULE

### Customer Profile
- Full Name
- WhatsApp
- Email
- Address
- Notes
- Registration Date

### Customer Status
- Active
- Inactive
- VIP
- Blacklisted

### Loyalty Program
- Point System (earn saat transaksi)
- Reward redemption
- Membership tier

---

## 9. PET MANAGEMENT MODULE

### Pet Profile
- Name
- Photo
- Species
- Breed
- Gender
- Birth Date / Age
- Weight
- Color
- Sterilization Status
- Microchip Number

### Relasi
- 1 customer dapat memiliki banyak hewan

### QR Pet Card
- Setiap hewan memiliki QR Code unik
- Scan QR → langsung ke profil hewan

---

## 10. MEDICAL RECORD MODULE

### SOAP Record
- Subjective: keluhan
- Objective: hasil pemeriksaan fisik
- Assessment: diagnosa
- Plan: terapi dan tindakan

### Medical History
Menyimpan riwayat lengkap:
- Consultation
- Surgery
- Vaccination
- Treatment
- Inpatient

### Attachments
- Image
- PDF
- Hasil Laboratorium

### Prescription
- Nama obat
- Dosis
- Durasi
- Instruksi penggunaan

---

## 11. APPOINTMENT MODULE

### Online Booking
Customer dapat:
- Memilih layanan
- Memilih dokter
- Memilih tanggal dan jam

### Status Appointment
- Draft
- Pending
- Confirmed
- Checked In
- In Progress
- Completed
- Cancelled

### Queue System
- Generate nomor antrian otomatis
- Display antrian realtime

### Kalender View
- Tampilan harian / mingguan / bulanan
- Filter per dokter

---

## 12. PET MONITORING MODULE

### Health Timeline
Menampilkan seluruh aktivitas kesehatan hewan secara kronologis.

### Weight Monitoring
- Input berat berkala
- Grafik perkembangan berat badan

### Medication Monitoring
- Reminder jadwal obat
- Tracking kepatuhan minum obat

### Recovery Monitoring
- Monitoring pasca operasi
- Update kondisi harian

### Owner Upload
Customer dapat mengunggah:
- Foto kondisi hewan
- Catatan kondisi harian
untuk ditinjau oleh dokter.

---

## 13. VACCINATION MODULE

### Vaccine Schedule
- Nama vaksin
- Tanggal vaksinasi
- Next due date
- Dokter yang melakukan

### Reminder Otomatis
- H-30
- H-14
- H-7
- H-1
Via WhatsApp dan/atau Email.

### Vaccine Certificate
- Generate PDF sertifikat vaksinasi

---

## 14. INPATIENT MODULE

### Cage Management
Status kandang:
- Available
- Occupied
- Maintenance

### Daily Observation
Pencatatan harian:
- Suhu tubuh
- Nafsu makan
- Berat badan
- Kondisi umum
- Catatan dokter

### Medication Schedule
- Jadwal pemberian obat per jam
- Checklist pemberian

### Daily Report
- Laporan harian dapat diakses customer via portal

### Pending Bill
- Tagihan terakumulasi selama rawat inap
- Customer bayar saat hewan keluar
- Real-time cost tracking
- Bill otomatis terbuat saat hewan discharge

---

## 15. GROOMING MODULE

### Layanan
- Bath
- Full Grooming
- Flea Treatment
- Spa

### Grooming Record
- Riwayat lengkap per hewan
- Foto sebelum dan sesudah (opsional)

---

## 16. PETSHOP MODULE

### Product Management
- Category
- Brand
- SKU
- Barcode
- Harga jual
- Harga modal

### Product Variants
- Ukuran
- Berat
- Warna

### Product Gallery
- Multiple foto per produk

---

## 17. INVENTORY MODULE

### Item Types
- Obat-obatan
- Vaksin
- Makanan hewan
- Aksesoris

### Stock Movement
- Stock In (pembelian)
- Stock Out (pemakaian / penjualan)
- Adjustment (koreksi)

### Expiry Tracking
Notifikasi mendekati expired:
- 90 hari
- 60 hari
- 30 hari

### Batch Tracking
- Nomor batch per item
- Tracing ke supplier

---

## 18. POS MODULE

### Mode Transaksi
Dua mode yang dapat digunakan fleksibel:

**Mode 1 — Quick Sale**
Staff buka POS → pilih produk/layanan → checkout langsung.
Untuk transaksi walk-in atau penjualan produk saja.

**Mode 2 — From Invoice**
Invoice otomatis terbuat dari Medical Record / Appointment selesai.
Staff tinggal buka invoice → proses pembayaran.

### Item Transaksi
- Produk petshop
- Layanan klinik (konsultasi, grooming, vaksin, dll)
- Kombinasi produk + layanan dalam 1 transaksi

### Diskon
- Diskon nominal
- Diskon persentase
- Per item atau per transaksi

### Loyalitas
- Redeem poin saat checkout
- Earn poin otomatis setiap transaksi

### Metode Pembayaran
- Cash (dengan kalkulasi kembalian)
- Transfer Bank (catat nominal + bank tujuan)
- QRIS (catat manual, bukan auto-verify)
- Split Payment (kombinasi 2 metode)

### Pending Bill (khusus Inpatient)
- Tagihan rawat inap tidak perlu dibayar saat itu
- Akumulasi selama masa rawat inap
- Dibayar saat hewan discharge
- Status: Pending → Paid

### Dokumen
- Struk/receipt (print atau kirim WhatsApp)
- Invoice PDF
- Refund / retur transaksi

### Kasir
- Simple, tanpa shift management
- Laporan transaksi harian tersedia di Reports

---

## 19. ACCOUNTING MODULE

### Pemasukan
- Konsultasi
- Vaksinasi
- Operasi
- Grooming
- Penjualan produk

### Pengeluaran
- Pembelian inventory
- Gaji
- Utilitas
- Operasional lainnya

### Laporan
- Revenue harian/bulanan/tahunan
- Profit & Loss
- Cash Flow

---

## 20. NOTIFICATION MODULE

### Konfigurasi (dari dashboard Owner)
- Pilih provider WhatsApp: Fonnte atau Wablas
- Input API Key
- Input nomor pengirim
- Test kirim langsung dari form
- Status koneksi: Connected / Error / Not Configured

### Email
- Konfigurasi SMTP dari dashboard
- Test kirim dari form

### Semua config disimpan di tabel settings (bukan .env)
- Hanya Owner yang dapat membaca dan mengubah
- API Key ditampilkan masked (••••••••) setelah disimpan

### Event Trigger
Notifikasi otomatis dikirim saat:
- Booking dikonfirmasi
- Jadwal vaksinasi mendekati (H-30, H-14, H-7, H-1)
- Jadwal obat (reminder harian)
- Sesi grooming selesai
- Update kondisi hewan rawat inap
- Hewan discharge dari rawat inap
- Invoice siap dibayar

### Notification Log
- Semua notifikasi tercatat: berhasil / gagal
- Dapat di-retry manual jika gagal

---

## 21. REPORTING MODULE

### Laporan Klinik
- Total pasien per periode
- Pasien aktif
- Diagnosa terbanyak
- Performa per dokter (jumlah pasien, revenue kontribusi)

### Laporan Keuangan
- Revenue harian/bulanan/tahunan
- Pengeluaran
- Profit & Loss
- Cash Flow

### Laporan Produk
- Best seller
- Low stock
- Produk hampir expired

### Laporan Inventory
- Mutasi stok
- Nilai inventory

---

## 22. WEBSITE MODULE (Public)

Halaman publik yang dapat dikelola dari dashboard:

- Home (Hero, Services, Doctors, Testimonials, Articles, CTA)
- About
- Services + detail per layanan
- Doctors + profil per dokter
- Petshop (katalog produk)
- Articles / Blog
- Contact
- Online Booking

---

## 23. SETTINGS MODULE

### Profil Klinik
- Nama klinik
- Logo
- Alamat
- Nomor telepon
- Deskripsi

### Jam Operasional
- Per hari dalam seminggu
- Libur khusus

### Konfigurasi Invoice
- Template struk
- Header dan footer
- Nomor invoice otomatis

### Konfigurasi WhatsApp
- Provider (Fonnte / Wablas)
- API Key
- Nomor pengirim
- Test kirim

### Konfigurasi Email
- SMTP Host, Port, User, Password
- From email
- Test kirim

### Theme Settings
- Light / Dark mode default
- Warna aksen klinik

### Module Manager
- Enable / disable modul
- Status tiap modul

---

## 24. SECURITY

### Authentication
- Password hashing (Supabase Auth built-in)
- Session management (JWT)
- Email verification opsional

### Authorization
- RBAC: Owner, Doctor, Staff, Customer
- Row Level Security (RLS) di semua tabel Supabase
- API Key integrasi hanya dapat diakses Owner

### Audit Log
Mencatat semua aksi:
- Login / Logout
- Create / Update / Delete
- Data yang diubah: before & after value
- Timestamp + IP Address + User

---

## 25. NON-FUNCTIONAL REQUIREMENTS

### Performance
- Dashboard load < 3 detik
- Optimistic UI update untuk aksi umum
- Lazy loading per modul/halaman

### Availability
- Mengikuti uptime Supabase Cloud dan Vercel (99%+)

### Responsiveness
- Desktop (primary)
- Tablet
- Mobile

### UX Standards
- Skeleton loading di semua data fetch
- Toast notification untuk semua aksi
- Empty state illustration di semua halaman kosong
- Confirmation dialog untuk semua aksi hapus/permanen
- Form validation realtime
- Error boundary per halaman

---
 |
