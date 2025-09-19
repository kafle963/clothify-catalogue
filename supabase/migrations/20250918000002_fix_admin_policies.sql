/*
  # Fix admin policies to prevent infinite recursion

  The previous policies had a circular reference where they were checking
  the admins table within the same policy, causing infinite recursion.
  This migration fixes that by using auth.uid() directly instead of
  querying the admins table within the policy.
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can read admin data" ON admins;
DROP POLICY IF EXISTS "Admins can update own data" ON admins;
DROP POLICY IF EXISTS "Super admins can manage admins" ON admins;

-- Create new policies without recursion

-- Admins can read their own data
CREATE POLICY "Admins can read own data"
  ON admins
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can update their own data
CREATE POLICY "Admins can update own data"
  ON admins
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can insert their own data (needed for initial setup)
CREATE POLICY "Admins can insert own data"
  ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Super admins can manage all admins
CREATE POLICY "Super admins can manage all admins"
  ON admins
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
      AND is_active = true
    )
  );

-- Admins can delete their own data
CREATE POLICY "Admins can delete own data"
  ON admins
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());