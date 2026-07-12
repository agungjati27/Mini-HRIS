-- Complete Setup: Profiles Table + Leave Requests dengan Fixed Policies
-- Jalankan semua query di bawah di Supabase SQL Editor

-- ========================================
-- 1. ENSURE PROFILES TABLE EXISTS dengan role field
-- ========================================

-- Jika profiles table belum ada, buat:
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255),
  full_name VARCHAR(255),
  role VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tambahkan role column jika belum ada (UPDATE existing table)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50);

-- Enable RLS untuk profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies untuk profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create policies untuk profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- ========================================
-- 2. UPDATE EMPLOYEES TABLE (jika belum ada kolom)
-- ========================================

-- Pastikan employees table punya profile_id foreign key
-- (Asumsikan ini sudah ada, tapi cek struktur)
-- ALTER TABLE employees ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id);

-- ========================================
-- 3. FIX LEAVE_REQUESTS POLICIES
-- ========================================

-- Drop policies yang error
DROP POLICY IF EXISTS "Admins can view all leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Only admins can update leave requests" ON leave_requests;

-- Policy 1: Employees can view own leave requests (keep as is)
DROP POLICY IF EXISTS "Employees can view own leave requests" ON leave_requests;
CREATE POLICY "Employees can view own leave requests" ON leave_requests
  FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE profile_id = auth.uid()
    )
  );

-- Policy 2: Admins can view all leave requests (FIXED - gunakan profiles)
CREATE POLICY "Admins can view all leave requests" ON leave_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN profiles p ON e.profile_id = p.id
      WHERE p.id = auth.uid()
      AND (
        p.role = 'admin' 
        OR p.role = 'Admin'
        OR p.role = 'administrator'
        OR p.role = 'super_admin'
      )
    )
  );

-- Policy 3: Employees can create leave requests (keep as is)
DROP POLICY IF EXISTS "Employees can create leave requests" ON leave_requests;
CREATE POLICY "Employees can create leave requests" ON leave_requests
  FOR INSERT
  WITH CHECK (
    employee_id IN (
      SELECT id FROM employees WHERE profile_id = auth.uid()
    )
  );

-- Policy 4: Only admins can update leave requests (FIXED - gunakan profiles)
CREATE POLICY "Only admins can update leave requests" ON leave_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN profiles p ON e.profile_id = p.id
      WHERE p.id = auth.uid()
      AND (
        p.role = 'admin' 
        OR p.role = 'Admin'
        OR p.role = 'administrator'
        OR p.role = 'super_admin'
      )
    )
  );

-- ========================================
-- 4. VERIFY SETUP
-- ========================================

-- Query untuk verify:
-- Pastikan admin user memiliki role yang benar di profiles table
-- SELECT id, email, role FROM profiles LIMIT 5;
-- 
-- Pastikan employees linked ke profiles:
-- SELECT e.id, e.profile_id, p.role FROM employees e 
-- LEFT JOIN profiles p ON e.profile_id = p.id LIMIT 5;
