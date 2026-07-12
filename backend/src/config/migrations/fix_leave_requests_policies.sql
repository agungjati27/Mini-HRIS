-- Fix for "permission denied for table users" error
-- Drop existing policies that cause permission issues
DROP POLICY IF EXISTS "Admins can view all leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Only admins can update leave requests" ON leave_requests;

-- Policy 2: Admins can view all leave requests (IMPROVED - tidak akses auth.users)
-- Gunakan employees + profiles table dengan safer approach
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

-- Policy 4: Only admins can update leave requests (IMPROVED - tidak akses auth.users)
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

-- Pastikan profiles table memiliki RLS yang tepat
-- Jika belum, uncomment baris di bawah
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy untuk profiles table (jika belum ada)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);
