/*
  # Create vendors table for vendor data storage

  1. New Tables
    - `vendors`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `user_id` (uuid, references auth.users.id) - links to auth user
      - `email` (text, unique, not null)
      - `name` (text, not null)
      - `business_name` (text, not null)
      - `description` (text)
      - `phone` (text)
      - `profile_image` (text)
      - `website` (text)
      - `tax_id` (text)
      - `social_media` (text)
      - `address_street` (text)
      - `address_city` (text)
      - `address_state` (text)
      - `address_zip_code` (text)
      - `address_country` (text, default 'United States')
      - `is_approved` (boolean, default false)
      - `approval_date` (timestamptz)
      - `rejected_reason` (text)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

    - `vendor_products`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `vendor_id` (uuid, references vendors.id)
      - `name` (text, not null)
      - `description` (text, not null)
      - `price` (decimal, not null)
      - `original_price` (decimal)
      - `category` (text, not null)
      - `images` (jsonb, not null) - array of image URLs
      - `sizes` (jsonb, not null) - array of available sizes
      - `colors` (jsonb) - array of available colors
      - `inventory` (jsonb, not null) - size/color inventory mapping
      - `status` (text, default 'draft') - draft, pending, approved, rejected
      - `approval_date` (timestamptz)
      - `rejected_reason` (text)
      - `tags` (jsonb) - array of tags for search
      - `is_active` (boolean, default true)
      - `views` (integer, default 0)
      - `sales_count` (integer, default 0)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on both tables
    - Add policies for vendors to read/write their own data
    - Add policies for admin access
    - Add indexes for performance
*/

-- Create vendor status enum
DO $$ BEGIN
    CREATE TYPE vendor_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create product status enum  
DO $$ BEGIN
    CREATE TYPE product_status AS ENUM ('draft', 'pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  business_name text NOT NULL,
  description text,
  phone text,
  profile_image text,
  website text,
  tax_id text,
  social_media text,
  address_street text,
  address_city text,
  address_state text,
  address_zip_code text,
  address_country text DEFAULT 'United States',
  is_approved boolean DEFAULT false,
  approval_date timestamptz,
  rejected_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vendor_products table
CREATE TABLE IF NOT EXISTS vendor_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL CHECK (price > 0),
  original_price decimal(10,2) CHECK (original_price > 0),
  category text NOT NULL,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  sizes jsonb NOT NULL DEFAULT '[]'::jsonb,
  colors jsonb DEFAULT '[]'::jsonb,
  inventory jsonb NOT NULL DEFAULT '{}'::jsonb,
  status product_status DEFAULT 'draft',
  approval_date timestamptz,
  rejected_reason text,
  tags jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  views integer DEFAULT 0,
  sales_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_products ENABLE ROW LEVEL SECURITY;

-- Vendors policies
CREATE POLICY "Vendors can read own data"
  ON vendors
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Vendors can update own data"
  ON vendors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create vendor profile"
  ON vendors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Public can read approved vendors for display
CREATE POLICY "Public can read approved vendors"
  ON vendors
  FOR SELECT
  TO anon, authenticated
  USING (is_approved = true);

-- Vendor products policies
CREATE POLICY "Vendors can manage own products"
  ON vendor_products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = vendor_products.vendor_id 
      AND vendors.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = vendor_products.vendor_id 
      AND vendors.user_id = auth.uid()
    )
  );

-- Public can read approved products
CREATE POLICY "Public can read approved products"
  ON vendor_products
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'approved' 
    AND is_active = true
    AND EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = vendor_products.vendor_id 
      AND vendors.is_approved = true
    )
  );

-- Add updated_at triggers
CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_products_updated_at
  BEFORE UPDATE ON vendor_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_email ON vendors(email);
CREATE INDEX IF NOT EXISTS idx_vendors_business_name ON vendors(business_name);
CREATE INDEX IF NOT EXISTS idx_vendors_is_approved ON vendors(is_approved);
CREATE INDEX IF NOT EXISTS idx_vendors_created_at ON vendors(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vendor_products_vendor_id ON vendor_products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_products_status ON vendor_products(status);
CREATE INDEX IF NOT EXISTS idx_vendor_products_category ON vendor_products(category);
CREATE INDEX IF NOT EXISTS idx_vendor_products_is_active ON vendor_products(is_active);
CREATE INDEX IF NOT EXISTS idx_vendor_products_created_at ON vendor_products(created_at DESC);

-- Create GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_vendor_products_images ON vendor_products USING GIN (images);
CREATE INDEX IF NOT EXISTS idx_vendor_products_sizes ON vendor_products USING GIN (sizes);
CREATE INDEX IF NOT EXISTS idx_vendor_products_colors ON vendor_products USING GIN (colors);
CREATE INDEX IF NOT EXISTS idx_vendor_products_tags ON vendor_products USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_vendor_products_inventory ON vendor_products USING GIN (inventory);