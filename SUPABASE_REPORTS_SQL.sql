-- SQL opsional untuk Supabase agar halaman reports bisa membaca data attendance dengan aman.
-- Jalankan di SQL Editor Supabase jika endpoint admin belum menampilkan data.

-- 1) Pastikan tabel attendance punya kolom yang dibutuhkan.
-- Jika belum ada, tambahkan kolom status jika diperlukan.
ALTER TABLE IF EXISTS public.attendance
ADD COLUMN IF NOT EXISTS status text;

-- 2) Pastikan RLS pada tabel attendance bisa dibaca oleh admin.
-- Jika RLS belum aktif, aktifkan dulu.
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 3) Policy agar admin bisa membaca semua data attendance.
-- Ganti role sesuai nilai role di tabel profiles Anda (mis. admin).
CREATE POLICY IF NOT EXISTS "admins_can_view_all_attendance"
ON public.attendance
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND lower(coalesce(p.role, '')) IN ('admin', 'administrator', 'super_admin', 'superadmin', 'hr_admin', 'owner')
  )
);

-- 4) Policy agar employee bisa melihat data absensinya sendiri (opsional, untuk kompatibilitas).
CREATE POLICY IF NOT EXISTS "employees_can_view_own_attendance"
ON public.attendance
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.employees e
    WHERE e.id = attendance.employee_id
      AND e.profile_id = auth.uid()
  )
);

-- 5) Jika Anda memakai tabel profiles, pastikan kolom role ada.
-- Contoh update role admin:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'USER_ID_HERE';
