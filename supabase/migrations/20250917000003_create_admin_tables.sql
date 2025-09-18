/*
  # Create admin table for admin management

  1. New Table
    - `admins`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `user_id` (uuid, references auth.users.id) - links to auth user
      - `email` (text, unique, not null)
      - `name` (text, not null)
      - `role` (text, not null) - super_admin, admin, moderator
      - `permissions` (jsonb, not null) - array of permission objects
      - `is_active` (boolean, default true)
      - `last_login` (timestamptz)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on admin table
    - Add policies for admin access
    - Add indexes for performance
*/

-- Create admin role enum
DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'moderator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role admin_role NOT NULL DEFAULT 'admin',
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admins policies - only authenticated admins can access admin data
CREATE POLICY "Admins can read admin data"
  ON admins
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins a 
      WHERE a.user_id = auth.uid() 
      AND a.is_active = true
    )
  );

CREATE POLICY "Admins can update own data"
  ON admins
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Super admins can manage other admins
CREATE POLICY "Super admins can manage admins"
  ON admins
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins a 
      WHERE a.user_id = auth.uid() 
      AND a.role = 'super_admin'
      AND a.is_active = true
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins(is_active);
CREATE INDEX IF NOT EXISTS idx_admins_created_at ON admins(created_at DESC);

-- Create GIN index for JSONB permissions column
CREATE INDEX IF NOT EXISTS idx_admins_permissions ON admins USING GIN (permissions);

-- Insert a default super admin (optional - for initial setup)
-- This should be done manually in production with proper credentials
INSERT INTO admins (email, name, role, permissions, is_active) 
VALUES (
  'admin@clothify.com',
  'System Administrator',
  'super_admin',
  '[
    {"resource": "vendors", "actions": ["create", "read", "update", "delete", "approve", "reject"]},
    {"resource": "products", "actions": ["create", "read", "update", "delete", "approve", "reject"]},
    {"resource": "users", "actions": ["create", "read", "update", "delete"]},
    {"resource": "orders", "actions": ["create", "read", "update", "delete"]},
    {"resource": "analytics", "actions": ["read"]},
    {"resource": "settings", "actions": ["create", "read", "update", "delete"]}
  ]'::jsonb,
  true
) ON CONFLICT (email) DO NOTHING;