# Setup Database Leave Requests di Supabase

## ⚠️ PENTING: Jika mendapat error "permission denied for table users"

Jika saat membuka halaman admin Approvals muncul error **"permission denied for table users"**, berarti Anda menggunakan policy lama yang mencoba akses `auth.users` table. 

**Solusi cepat:**
1. Re-run SQL dibawah (Step 1) - policy sudah di-fix untuk gunakan `profiles` table
2. Atau jalankan file: `backend/src/config/migrations/complete_setup_with_fix.sql`

---

## Panduan Lengkap Implementasi

### Step 1: Buat Tabel Leave Requests di Supabase SQL Editor

Buka Supabase Dashboard → SQL Editor → Buat Query Baru, kemudian copy-paste query berikut:

```sql
-- Create leave_requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('cuti_sakit', 'cuti_melahirkan', 'cuti_alasan_penting')),
  reason TEXT NOT NULL,
  attachment_url TEXT, -- For sick leave (doctor's certificate)
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_days INTEGER, -- Set by admin for sick and important leave; auto 90 for maternity
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_created_at ON leave_requests(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Employees can view own leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Admins can view all leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Employees can create leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Only admins can update leave requests" ON leave_requests;

-- Policy 1: Employees can view their own leave requests
CREATE POLICY "Employees can view own leave requests" ON leave_requests
  FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE profile_id = auth.uid()
    )
  );

-- Policy 2: Admins can view all leave requests (FIXED - gunakan profiles table)
CREATE POLICY "Admins can view all leave requests" ON leave_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN profiles p ON e.profile_id = p.id
      WHERE p.id = auth.uid()
      AND (p.role = 'admin' OR p.role = 'Admin' OR p.role = 'administrator' OR p.role = 'super_admin')
    )
  );

-- Policy 3: Employees can create their own leave requests
CREATE POLICY "Employees can create leave requests" ON leave_requests
  FOR INSERT
  WITH CHECK (
    employee_id IN (
      SELECT id FROM employees WHERE profile_id = auth.uid()
    )
  );

-- Policy 4: Only admins can update leave requests (FIXED - gunakan profiles table)
CREATE POLICY "Only admins can update leave requests" ON leave_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN profiles p ON e.profile_id = p.id
      WHERE p.id = auth.uid()
      AND (p.role = 'admin' OR p.role = 'Admin' OR p.role = 'administrator' OR p.role = 'super_admin')
    )
  );

-- Create trigger to auto-update updated_at
DROP FUNCTION IF EXISTS update_leave_requests_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_leave_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW() AT TIME ZONE 'UTC';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leave_requests_updated_at ON leave_requests;

CREATE TRIGGER leave_requests_updated_at
BEFORE UPDATE ON leave_requests
FOR EACH ROW
EXECUTE FUNCTION update_leave_requests_updated_at();
```

### Step 2: Verifikasi Struktur Database

Setelah menjalankan query, periksa struktur tabel:
- Buka Supabase → Data Editor
- Klik table `leave_requests`
- Pastikan semua kolom ada dengan tipe yang benar

### Step 3: Konfigurasi Permissions di Supabase

1. Buka **Database** → **Policies** (di table leave_requests)
2. Pastikan 4 policy sudah terbuat:
   - ✓ "Employees can view own leave requests"
   - ✓ "Admins can view all leave requests"  
   - ✓ "Employees can create leave requests"
   - ✓ "Only admins can update leave requests"

### Penjelasan Sistem Cuti

#### 1. Cuti Sakit (cuti_sakit)
- **Persyaratan**: Wajib upload surat keterangan dokter
- **Tanggal**: Tidak perlu pilih tanggal saat pengajuan
- **Approval**: Admin menentukan berapa hari yang disetujui
- **Contoh**: Karyawan mengajukan cuti sakit → Admin approve 3 hari

#### 2. Cuti Melahirkan (cuti_melahirkan)
- **Persyaratan**: Tidak ada
- **Tanggal**: Tidak perlu pilih tanggal
- **Approval**: Otomatis 90 hari (3 bulan) ketika admin approve
- **Catatan**: Semua approval cuti melahirkan = 90 hari

#### 3. Cuti Alasan Penting (cuti_alasan_penting)
- **Persyaratan**: Tidak ada
- **Tanggal**: Tidak perlu pilih tanggal
- **Approval**: Admin menentukan berapa hari yang disetujui
- **Contoh**: Karyawan butuh kerjakan sesuatu mendesak → Admin approve 2 hari

### Kolom Database Penjelasan

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | UUID | Primary key |
| employee_id | UUID | Reference ke employees table |
| type | VARCHAR(50) | 'cuti_sakit', 'cuti_melahirkan', 'cuti_alasan_penting' |
| reason | TEXT | Alasan pengajuan cuti (wajib) |
| attachment_url | TEXT | URL file bukti dokter (untuk cuti_sakit saja) |
| status | VARCHAR(50) | 'pending', 'approved', 'rejected' |
| approved_days | INTEGER | Jumlah hari yang disetujui admin |
| admin_note | TEXT | Catatan dari admin |
| created_at | TIMESTAMP | Waktu pengajuan |
| updated_at | TIMESTAMP | Waktu terakhir update |

### Testing

1. **Sebagai Employee:**
   - Buka halaman Approvals
   - Tab "Ajukan Cuti Baru"
   - Pilih tipe cuti
   - Isi alasan
   - Jika Cuti Sakit, upload surat dokter
   - Submit

2. **Sebagai Admin:**
   - Buka halaman Approvals
   - Lihat "Daftar Permohonan Cuti"
   - Klik "Review Permohonan" pada pengajuan
   - Pilih Setujui/Tolak
   - Isi jumlah hari (otomatis 90 untuk melahirkan)
   - Tambah catatan jika ada
   - Simpan

### Troubleshooting

**Q: Error "permission denied"?**
A: Cek bahwa:
- User login dengan role 'admin' atau 'employee'
- Policy sudah ter-create dengan benar
- user_meta_data role sudah di-set

**Q: Upload file tidak berfungsi?**
A: Saat ini hanya simpan nama file. Untuk produksi, setup Supabase Storage bucket terpisah.

**Q: Query return kosong?**
A: Cek:
- employees table sudah punya data
- profile_id di employees match dengan auth.uid()
