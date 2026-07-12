# TODO - Admin / Employee Role, Approvals, Cuti-Izin

## Backend
- [ ] Tambah middleware role guard (mis. roleMiddleware.js) untuk cek `req.user.role` (dari Supabase `profiles.role` / atau dari token).
- [ ] Tambah controller + routes untuk fitur approvals cuti/izin:
  - [ ] POST: employee submit request
  - [ ] GET: employee list own requests
  - [ ] GET: admin list semua requests
  - [ ] PATCH: admin approve/reject + note
- [ ] Tambah endpoints admin untuk:
  - [ ] GET employees (list)
  - [ ] GET reports (minimal: rekap absensi via existing adminAttendanceController atau endpoint baru)
- [ ] Wire routes baru ke `backend/src/app.js`

## Frontend
- [ ] Perbaiki `frontend/src/layouts/AppSidebar.jsx` jadi role-based menu:
  - employee: Dashboard, Attendance, Approvals, Profile, Settings, Logout
  - admin: Dashboard, Attendance, Employees, Reports, Approvals, Profile, Settings, Logout
- [ ] Perbaiki route link yang tidak ada (mis. `/history`, `/reports`) agar konsisten dengan halaman yang benar.
- [ ] Tambah halaman:
  - [ ] Approvals (employee submit + status; admin approve/reject)
  - [ ] Admin Employees
  - [ ] Admin Reports
- [ ] Update `frontend/src/routes/AppRoutes.jsx` menambahkan route yang sesuai untuk role admin/employee.
- [ ] Tingkatkan `frontend/src/routes/ProtectedRoute.jsx` agar bisa membatasi role (admin-only pages).
- [ ] Tambah services API untuk leave/approvals, admin employees, admin reports.

## Verifikasi
- [ ] Jalankan backend + frontend, tes:
  - [ ] Pegawai hanya melihat menu employee
  - [ ] Pegawai tidak bisa akses Employees/Reports
  - [ ] Pegawai bisa submit cuti/izin
  - [ ] Admin bisa approve/reject
