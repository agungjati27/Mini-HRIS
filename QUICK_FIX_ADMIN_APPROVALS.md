# 🔧 FIX: Admin Approvals - Permission Denied Error

## ❌ Masalah
Admin membuka halaman Approvals → Error: **"permission denied for table users"**

## ✅ Solusi (3 Langkah Cepat)

### Step 1: Update Policy di Supabase (PENTING!)

1. Buka **Supabase Dashboard** → **SQL Editor** → **New Query**
2. Copy-paste **SALAH SATU** dari pilihan di bawah:

#### Option A: Quick Fix (Hanya fix policies)
```sql
DROP POLICY IF EXISTS "Admins can view all leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Only admins can update leave requests" ON leave_requests;

CREATE POLICY "Admins can view all leave requests" ON leave_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN profiles p ON e.profile_id = p.id
      WHERE p.id = auth.uid()
      AND (p.role = 'admin' OR p.role = 'Admin' OR p.role = 'administrator')
    )
  );

CREATE POLICY "Only admins can update leave requests" ON leave_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN profiles p ON e.profile_id = p.id
      WHERE p.id = auth.uid()
      AND (p.role = 'admin' OR p.role = 'Admin' OR p.role = 'administrator')
    )
  );
```

#### Option B: Complete Setup (Recommended)
Jalankan file: `backend/src/config/migrations/complete_setup_with_fix.sql`

3. **Run** query → Success ✓

---

### Step 2: Verify Setup

```sql
-- Pastikan admin user punya role di profiles
SELECT id, email, role FROM profiles LIMIT 5;

-- Pastikan employees linked ke profiles
SELECT e.id, e.profile_id, p.role FROM employees e 
LEFT JOIN profiles p ON e.profile_id = p.id LIMIT 5;
```

Hasil harus menunjukkan:
- ✓ profiles.role = 'admin' (atau 'Admin', 'administrator')
- ✓ employees.profile_id linked ke profiles.id

---

### Step 3: Test di Frontend

1. **Refresh halaman** (clear cache jika perlu)
2. Login sebagai **Admin**
3. Buka **Approvals** 
4. Lihat tab **"Daftar Permohonan Cuti"** → data harus muncul ✓

---

## 🔍 Troubleshooting

### Error masih muncul?

**1. Cek apakah profiles table ada:**
```sql
SELECT * FROM profiles LIMIT 1;
```
- Jika error → Profiles table tidak ada
- Solution: Buat profiles table terlebih dahulu

**2. Cek role admin di profiles:**
```sql
SELECT * FROM profiles WHERE id = auth.uid();
```
- Pastikan `role` field = 'admin' atau 'Admin'
- Jika kosong → Update role:
```sql
UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_ADMIN_USER_ID';
```

**3. Lihat error message di browser:**
- Buka DevTools (F12) → Console
- Lihat full error message
- Share ke support jika still error

---

## 📊 Cara Kerja Sistem (Setelah Fix)

```
Admin Click "Approvals"
  ↓
Frontend call: GET /leave/requests
  ↓
Backend check: roleMiddleware("admin")
  → Verify admin role di profiles table ✓
  ↓
Backend query: leave_requests table
  ↓
RLS Policy Check:
  → Query employees + profiles
  → Verify auth.uid() = admin
  → Return all leave_requests ✓
  ↓
Frontend display: Daftar Permohonan Cuti
```

---

## 📝 Perubahan yang Sudah Dilakukan

### Frontend (`frontend/src/pages/Approvals.tsx`):
- ✅ Better error handling untuk permission errors
- ✅ Error message bisa multi-line
- ✅ Display helpful message jika permission denied

### Backend: 
- ✅ Sudah punya roleMiddleware di routes
- ✅ Validasi role di profiles table

### Database:
- ✅ Updated policies untuk gunakan `profiles` table bukan `auth.users`
- ✅ Fix SQL di: `backend/src/config/migrations/`

---

## 🚀 Selanjutnya

Setelah fix, admin bisa:
1. ✅ View semua permohonan cuti
2. ✅ Klik "Review Permohonan" 
3. ✅ Approve/Reject dengan jumlah hari
4. ✅ Tambah catatan

---

## 📞 Masih Error?

1. Pastikan **SEMUA 3 STEPS di atas sudah dikerjakan**
2. Clear browser cache: `Ctrl+Shift+Del`
3. Refresh halaman
4. Cek console (F12) untuk error message detail
5. Lihat file: `FIX_PERMISSION_ERROR.md` untuk detail lain

✅ **Done!** Admin seharusnya sekarang bisa akses Approvals.
