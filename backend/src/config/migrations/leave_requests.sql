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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_created_at ON leave_requests(created_at DESC);

-- Enable RLS
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- Policy 1: Employees can view their own leave requests
CREATE POLICY "Employees can view own leave requests" ON leave_requests
  FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE profile_id = auth.uid()
    )
  );

-- Policy 2: Admins can view all leave requests
CREATE POLICY "Admins can view all leave requests" ON leave_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN auth.users u ON e.profile_id = u.id
      WHERE u.id = auth.uid()
      AND u.raw_user_meta_data->>'role' = 'admin'
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

-- Policy 4: Only admins can update leave requests
CREATE POLICY "Only admins can update leave requests" ON leave_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN auth.users u ON e.profile_id = u.id
      WHERE u.id = auth.uid()
      AND u.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_leave_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leave_requests_updated_at
BEFORE UPDATE ON leave_requests
FOR EACH ROW
EXECUTE FUNCTION update_leave_requests_updated_at();
