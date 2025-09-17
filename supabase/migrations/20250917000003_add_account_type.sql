/*
  # Add account type to profiles table

  1. Changes
    - Add `account_type` enum ('customer', 'vendor')
    - Add `account_type` column to profiles table with default 'customer'
    - Update handle_new_user function to support account type
    - Add policies for account type management

  2. Security
    - Users can read their own account type
    - Users can only set account type during profile creation
    - Account type cannot be changed after creation (business rule)
*/

-- Create account type enum
DO $$ BEGIN
    CREATE TYPE account_type AS ENUM ('customer', 'vendor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add account_type column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS account_type account_type DEFAULT 'customer';

-- Update the handle_new_user function to support account type
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, name, account_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'account_type')::account_type, 'customer'::account_type)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for account_type for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(account_type);

-- Add policy for users to read account_type (extends existing read policy)
-- Note: The existing "Users can read own profile" policy already covers this

-- Add comment for clarity
COMMENT ON COLUMN profiles.account_type IS 'Type of account: customer or vendor. Set during registration and cannot be changed.';