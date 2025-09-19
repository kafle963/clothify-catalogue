/*
  # Fix admin access policies for vendor products and vendors

  The previous policies had potential recursion issues by checking the admins table
  within the policy. This migration fixes that by using a more direct approach.
*/

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Admins can read all vendor products" ON vendor_products;
DROP POLICY IF EXISTS "Admins can update vendor products" ON vendor_products;
DROP POLICY IF EXISTS "Admins can read all vendors" ON vendors;
DROP POLICY IF EXISTS "Admins can update vendors" ON vendors;

-- Create new policies without recursion

-- Admins can read all vendor products
CREATE POLICY "Admins can read all vendor products"
  ON vendor_products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Admins can update all vendor products
CREATE POLICY "Admins can update all vendor products"
  ON vendor_products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Admins can insert vendor products (for administrative actions)
CREATE POLICY "Admins can insert vendor products"
  ON vendor_products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Admins can delete vendor products (for administrative actions)
CREATE POLICY "Admins can delete vendor products"
  ON vendor_products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Admins can read all vendors
CREATE POLICY "Admins can read all vendors"
  ON vendors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Admins can update all vendors
CREATE POLICY "Admins can update all vendors"
  ON vendors
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Admins can insert vendors (for administrative actions)
CREATE POLICY "Admins can insert vendors"
  ON vendors
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Admins can delete vendors (for administrative actions)
CREATE POLICY "Admins can delete vendors"
  ON vendors
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );