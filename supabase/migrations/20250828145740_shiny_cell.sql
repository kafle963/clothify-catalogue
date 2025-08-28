/*
  # Fix profiles table and authentication issues

  1. Changes
    - Fix profile creation trigger with better error handling
    - Add service role policy for profile creation
    - Ensure proper RLS policies are in place
    - Handle edge cases in profile creation

  2. Security
    - Maintain existing RLS policies
    - Add service role access for trigger operations
    - Improve error handling in trigger function
*/

-- Ensure the profiles table exists with correct structure
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  street text,
  city text,
  state text,
  zip_code text,
  country text DEFAULT 'United States',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add service role policy for profile creation (needed for triggers)
DO $$ BEGIN
  CREATE POLICY "Service role can insert profiles"
    ON profiles
    FOR INSERT
    TO service_role
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Improved function to handle profile creation with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  BEGIN
    -- Try to insert the profile
    INSERT INTO profiles (id, email, name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1),
        'User'
      )
    );
    
    RAISE LOG 'Profile created successfully for user: %', NEW.id;
    
  EXCEPTION
    WHEN unique_violation THEN
      -- Profile already exists, this is fine
      RAISE LOG 'Profile already exists for user: %', NEW.id;
    WHEN foreign_key_violation THEN
      -- This shouldn't happen, but log it
      RAISE WARNING 'Foreign key violation when creating profile for user: %', NEW.id;
    WHEN OTHERS THEN
      -- Log any other errors but don't fail the user creation
      RAISE WARNING 'Unexpected error creating profile for user %: % - %', NEW.id, SQLSTATE, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger to ensure it uses the new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure the updated_at trigger function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the updated_at trigger exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();