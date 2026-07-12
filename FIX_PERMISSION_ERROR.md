# FIX: Permission Denied for Table Users

## Masalah
Saat admin membuka halaman Approvals, muncul error: **"permission denied for table users"**

## Penyebab
Policy di tabel `leave_requests` mencoba akses `auth.users` table yang tidak memiliki permission. Supabase menolak akses langsung ke auth.users dari policy.

## Solusi

### Option 1: Update Policy (RECOMMENDED)

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Drop policies yang error
DROP POLICY IF EXISTS "Admins can view all leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Only admins can update leave requests" ON leave_requests;

-- Policy baru: Admins can view all leave requests
-- Menggunakan employees + profiles table (lebih aman)
CREATE POLICY "Admins can view all leave requests" ON leave_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN profiles p ON e.profile_id = p.id
      WHERE e.profile_id = auth.uid()
      AND (
        p.role = 'admin' 
        OR p.role = 'Admin'
        OR p.role = 'administrator'
        OR p.role = 'super_admin'
      )
    )
  );

-- Policy baru: Only admins can update leave requests
CREATE POLICY "Only admins can update leave requests" ON leave_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN profiles p ON e.profile_id = p.id
      WHERE e.profile_id = auth.uid()
      AND (
        p.role = 'admin' 
        OR p.role = 'Admin'
        OR p.role = 'administrator'
        OR p.role = 'super_admin'
      )
    )
  );
```

### Option 2: Disable RLS (QUICK FIX, NOT RECOMMENDED FOR PRODUCTION)

Jika hanya untuk testing:

```sql
ALTER TABLE leave_requests DISABLE ROW LEVEL SECURITY;
```

**⚠️ Warning**: Ini tidak aman untuk production. Hanya untuk development.

---

## Verifikasi

Setelah jalankan SQL:

1. **Buka Supabase → Table Editor**
2. Klik table `leave_requests`
3. Buka tab **Policies**
4. Pastikan 2 policy sudah update (tidak ada error)

```
✓ Employees can view own leave requests
✓ Admins can view all leave requests (UPDATED)
✓ Employees can create leave requests
✓ Only admins can update leave requests (UPDATED)
```

---

## Test

1. **Sebagai Admin:**
   - Login dengan akun admin
   - Buka Approvals
   - Lihat "Daftar Permohonan Cuti"
   - Pastikan data muncul (tidak ada error)
   - Klik "Review Permohonan" untuk test update

2. **Sebagai Employee:**
   - Login dengan akun employee
   - Buka Approvals
   - Tab "Ajukan Cuti Baru"
   - Submit permohonan
   - Lihat di Tab "Pengajuan Saya"

---

## Troubleshooting

### Error Masih Muncul?

1. **Pastikan profiles table ada**
   ```sql
   SELECT * FROM profiles LIMIT 1;
   ```
   Jika error: profiles table tidak ada/tidak accessible
   - Create profiles table dengan field: id, role
   - Link dengan auth.users via id

2. **Pastikan employees.profile_id match auth.uid()**
   ```sql
   SELECT e.id, e.profile_id, p.role 
   FROM employees e
   LEFT JOIN profiles p ON e.profile_id = p.id
   LIMIT 5;
   ```

3. **Cek role di profiles table**
   ```sql
   SELECT id, role FROM profiles WHERE id = auth.uid();
   ```
   Role harus: 'admin', 'Admin', 'administrator', atau 'super_admin'

---

## Architecture Penjelasan

### Data Flow for Admin View:
```
Admin Request (GET /leave/requests)
  ↓
Authorization Middleware
  → Check token valid
  → Check role dari profiles table
  ↓
getAllLeaveRequests()
  → Query leave_requests table
  ↓
RLS Policy Check
  → Verify admin status dari employees + profiles table
  → Return data jika authorized
```

### Why profiles table?
- `auth.users`: Supabase auth table (restricted access)
- `profiles`: Mirror table dengan role field (full access dengan RLS)
- `employees`: Employee data linked ke profiles

---

## File Referensi
- Original SQL: `backend/src/config/migrations/SETUP_LEAVE_REQUESTS.md`
- Fix SQL: `backend/src/config/migrations/fix_leave_requests_policies.sql`
