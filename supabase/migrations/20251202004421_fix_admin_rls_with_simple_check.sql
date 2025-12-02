/*
  # Fix Admin RLS with Simple Role Check

  This migration fixes admin access to all users by using a simple approach:
  - Use a security definer function that runs with elevated privileges
  - Function caches the result to avoid multiple queries
  - Policies use this function to check admin status

  ## Changes
  - Drop problematic policies and function
  - Create improved is_admin function with caching
  - Create admin policies that work correctly
  
  ## Security
  - Function is SECURITY DEFINER but only returns boolean
  - Admins can read/update all users
  - Regular users can only access their own data and verified providers
*/

-- Drop existing policies and function
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP FUNCTION IF EXISTS is_admin();

-- Create an improved admin check function
-- This function uses SECURITY DEFINER to bypass RLS when checking admin status
CREATE OR REPLACE FUNCTION check_is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Query with SECURITY DEFINER bypasses RLS
  SELECT role INTO user_role
  FROM users
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_role = 'admin', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_is_admin() TO authenticated;

-- Create admin read policy
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (check_is_admin());

-- Create admin update policy  
CREATE POLICY "Admins can update all users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (check_is_admin())
  WITH CHECK (check_is_admin());

-- Note: The SECURITY DEFINER function bypasses RLS when it runs,
-- so it won't cause infinite recursion. The result is then used
-- in the policy check.
