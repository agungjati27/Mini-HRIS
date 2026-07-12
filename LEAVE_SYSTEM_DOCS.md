# Dokumentasi Perubahan Sistem Pengajuan Cuti

## 📋 Ringkasan Perubahan

Halaman Approvals telah dibuat ulang sesuai dengan requirement baru:

### ✅ Fitur Utama

#### Tipe Cuti yang Didukung:

1. **Cuti Sakit (Cuti Sakit)**
   - Persyaratan: Upload surat keterangan dokter (wajib)
   - Tanggal: Admin yang menentukan
   - Jumlah hari: Admin yang approve berapa hari

2. **Cuti Melahirkan (Cuti Melahirkan)**
   - Persyaratan: Tidak ada
   - Tanggal: Otomatis 3 bulan (90 hari) saat approved
   - Jumlah hari: Selalu 90 hari (fixed)

3. **Cuti Alasan Penting (Cuti Alasan Penting)**
   - Persyaratan: Tidak ada
   - Tanggal: Admin yang menentukan
   - Jumlah hari: Admin yang approve berapa hari

### 📁 File yang Dimodifikasi

#### Frontend:
- ✏️ `frontend/src/pages/Approvals.tsx` - Halaman baru tanpa input tanggal
- ✏️ `frontend/src/services/leaveService.ts` - Update interface (hapus start_date, end_date)

#### Backend:
- ✏️ `backend/src/controllers/leaveController.js` - Update logika sesuai requirement
- ✏️ `backend/src/routes/leaveRoutes.js` - Routes sudah OK, tidak perlu diubah

#### Database:
- 📝 `backend/src/config/migrations/SETUP_LEAVE_REQUESTS.md` - Dokumentasi lengkap setup
- 📝 `backend/src/config/migrations/leave_requests.sql` - SQL script

### 📊 Database Schema

Tabel `leave_requests`:
```
- id (UUID) - Primary Key
- employee_id (UUID) - Foreign Key to employees
- type (VARCHAR) - cuti_sakit | cuti_melahirkan | cuti_alasan_penting
- reason (TEXT) - Alasan pengajuan (wajib)
- attachment_url (TEXT) - URL surat dokter (hanya untuk cuti_sakit)
- status (VARCHAR) - pending | approved | rejected
- approved_days (INTEGER) - Hari yang disetujui admin
- admin_note (TEXT) - Catatan dari admin
- created_at (TIMESTAMP) - Waktu dibuat
- updated_at (TIMESTAMP) - Waktu update terakhir
```

### 🔐 Row Level Security Policies

4 policy sudah disiapkan:
1. Employees dapat melihat pengajuan mereka sendiri
2. Admins dapat melihat semua pengajuan
3. Employees dapat membuat pengajuan
4. Hanya admins yang dapat update pengajuan

## 🚀 Setup Instructions

### Step 1: Setup Database di Supabase

1. Buka Supabase Dashboard
2. Go to SQL Editor → New Query
3. Copy-paste SQL dari `backend/src/config/migrations/SETUP_LEAVE_REQUESTS.md`
4. Run query
5. Verify bahwa tabel dan policies sudah terbuat

### Step 2: Test Frontend

1. Buka aplikasi di browser
2. Login sebagai Employee
3. Navigasi ke halaman "Permohonan Cuti"
4. Tab "Ajukan Cuti Baru"
5. Test pengajuan untuk setiap tipe cuti

### Step 3: Test Admin Review

1. Login sebagai Admin
2. Buka "Permohonan Cuti"
3. Klik "Review Permohonan" pada pengajuan
4. Test Setujui/Tolak dengan jumlah hari

## 📝 Perubahan API/Backend

### Create Leave Request
**Endpoint**: `POST /leave/requests`
**Request Body** (BARU - tanpa tanggal):
```json
{
  "type": "cuti_sakit | cuti_melahirkan | cuti_alasan_penting",
  "reason": "Alasan pengajuan",
  "attachment_url": "url_dokter" // optional, wajib untuk cuti_sakit
}
```

**Response**:
```json
{
  "message": "Permohonan cuti berhasil diajukan",
  "data": {
    "id": "uuid",
    "employee_id": "uuid",
    "type": "cuti_sakit",
    "reason": "...",
    "status": "pending",
    "created_at": "2024-01-01T10:00:00Z",
    ...
  }
}
```

### Review Leave Request
**Endpoint**: `PATCH /leave/requests/:id`
**Request Body**:
```json
{
  "status": "approved | rejected",
  "approved_days": 3, // wajib untuk sick & important, auto 90 untuk maternity
  "admin_note": "catatan opsional"
}
```

### Get Leave Requests
**Endpoint**: `GET /leave/requests/me` (Employee)
**Endpoint**: `GET /leave/requests` (Admin)
**Response**: Array dari leave requests (tanpa start_date/end_date)

## 🔄 Workflow Pengajuan Cuti

```
Employee:
  1. Buka Approvals → Ajukan Cuti Baru
  2. Pilih tipe cuti
  3. Isi alasan pengajuan
  4. Jika sakit: Upload surat dokter
  5. Submit → Status: PENDING

Admin:
  1. Lihat list permohonan cuti
  2. Klik Review Permohonan
  3. Pilih Status (Setujui/Tolak)
  4. Isi jumlah hari (auto 90 untuk melahirkan)
  5. Tambah catatan (opsional)
  6. Simpan Review → Status: APPROVED/REJECTED

Employee:
  1. Lihat status permohonan di Tab "Pengajuan Saya"
  2. Lihat detail: jumlah hari disetujui, catatan admin
```

## ⚠️ Catatan Penting

1. **File Upload**: Saat ini hanya menyimpan nama file. Untuk produksi, integrasikan dengan Supabase Storage.

2. **Maternity Leave**: Otomatis 90 hari, tidak bisa diubah. Admin hanya bisa setujui atau tolak.

3. **Date Logic**: Admin menentukan tanggal cuti saat employee masuk, tidak saat pengajuan.

4. **Approval Days**: 
   - Sick Leave: Ditentukan admin saat review
   - Maternity Leave: Otomatis 90 hari
   - Important Reason: Ditentukan admin saat review

## 🧪 Test Cases

### Test 1: Submit Cuti Sakit Tanpa File
```
Expected: Error - "Cuti sakit memerlukan surat keterangan dokter"
Status: ✓
```

### Test 2: Submit Cuti Melahirkan
```
Input: Type=Melahirkan, Reason="Akan melahirkan anak kedua"
Expected: Success, Status=PENDING
Admin approval: Auto 90 hari
Status: ✓
```

### Test 3: Admin Review dan Approve
```
Input: Status=Approved, Approved_days=3
Expected: Status=APPROVED, approved_days=3
Status: ✓
```

## 📞 Support

Jika ada error atau pertanyaan:
1. Cek console browser untuk error message
2. Cek backend logs untuk server-side error
3. Pastikan database policies sudah ter-create dengan benar
