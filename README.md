# Mini HRIS

Mini HRIS is a web-based Human Resource Information System designed to support digital management of employee data, attendance, leave requests, and administrative reporting. This project aims to provide a practical and scalable solution for organizations that require centralized HR operations with a modern and user-friendly interface.

The system is developed as a full-stack application that combines a React-based frontend, an Express.js backend, and Supabase for database and authentication services. It is intended to streamline routine HR processes while improving visibility and operational efficiency for administrators and employees.

## Fitur utama
- Login dan registrasi akun
- Dashboard admin untuk melihat ringkasan aktivitas
- Manajemen data karyawan
- Absensi harian dengan dukungan QR
- Pengajuan dan persetujuan cuti
- Laporan admin untuk rekapan absensi
- Export data ke Excel/CSV/PDF

## Teknologi yang digunakan
### Frontend
- React.js
- Vite
- Tailwind CSS
- Lucide React
- React Router DOM
- Axios
- XLSX untuk export Excel

### Backend
- Node.js
- Express.js
- Supabase sebagai backend database dan autentikasi
- JWT untuk autentikasi
- QR Code generation
- Multer untuk upload file

### Lain-lain
- REST API
- CORS
- dotenv
- npm

## Struktur proyek
- frontend/: aplikasi React untuk antarmuka pengguna
- backend/: API server dan logika bisnis
- SUPABASE_REPORTS_SQL.sql: script SQL pendukung untuk laporan admin

## Cara menjalankan lokal
### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## Konfigurasi environment
Buat file .env di folder backend sesuai kebutuhan, misalnya:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Cara push ke GitHub yang baik dan benar
1. Pastikan repository sudah siap dan file penting tidak mengandung secret.
2. Tambahkan file yang penting ke git.
3. Buat commit dengan pesan yang jelas.
4. Buat branch utama `main`.
5. Tambahkan remote GitHub.
6. Push ke GitHub.

### Langkah-langkah
```bash
git status
git add .
git commit -m "feat: initial HRIS project setup"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git push -u origin main
```

### Tips penting
- Jangan upload file `.env`, folder `node_modules`, dan hasil build `dist`.
- Gunakan commit message yang konsisten, misalnya:
  - `feat:` untuk fitur baru
  - `fix:` untuk perbaikan bug
  - `docs:` untuk dokumentasi
- Jika repository sudah ada, gunakan:
```bash
git remote set-url origin https://github.com/USERNAME/REPO_NAME.git
git push -u origin main
```

## Catatan proyek
Proyek ini merupakan implementasi awal sistem informasi HRIS berbasis web yang menggabungkan frontend modern, backend API, dan database cloud melalui Supabase. Fokus utamanya adalah mempermudah pengelolaan absensi, data karyawan, pengajuan cuti, dan monitoring admin.
