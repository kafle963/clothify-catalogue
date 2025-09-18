/*
  # Add admin access policies for vendor products and vendors

  This migration adds policies to allow admins to access all vendor products and vendors
  for administrative purposes (reviewing, approving, rejecting).
*/

-- Add admin policies for vendor_products table
CREATE POLICY "Admins can read all vendor products"
  ON vendor_products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can update vendor products"
  ON vendor_products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- Add admin policies for vendors table
CREATE POLICY "Admins can read all vendors"
  ON vendors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can update vendors"
  ON vendors
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );