/*
  # Fix Admin Access Using Auth Metadata

  This migration enables admin users to read all users by checking the role
  stored in the auth.users table's raw_user_meta_data, avoiding recursion.

  ## Problem
  - Previous policies created infinite recursion by querying users table within users policies
  - Admin dashboard cannot display user list without proper RLS policy

  ## Solution
  - Drop recursive policies
  - Create policy that checks role via auth.jwt() which contains user metadata
  - Store role in user metadata during registration for non-recursive access

  ## Changes
  - Drop old admin policies
  - Create new admin read policy using JWT metadata check
  
  ## Security
  - Admins can read all users
  - Regular users can only read their own profile and verified providers
  - No circular dependencies
*/

-- Drop the recursive policy we just created
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Create a function to safely check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the role claim in JWT is 'admin'
  -- This avoids querying the users table
  RETURN (
    SELECT COALESCE(
      (current_setting('request.jwt.claims', true)::json->>'role')::text = 'admin',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Now create the admin read policy using the function
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admin update policy
CREATE POLICY "Admins can update all users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
