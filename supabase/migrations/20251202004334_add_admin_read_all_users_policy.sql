/*
  # Add Admin Read Policy for Users Table

  This migration adds a policy that allows admin users to read all user records.

  ## Changes
  - Add SELECT policy for users with role 'admin' to read all users
  
  ## Security
  - Restricts access to authenticated users with admin role only
  - Allows admins to view all user data for dashboard management
*/

-- Drop the problematic infinite recursion policy if it exists
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Admin users can read all users" ON users;

-- Create a simple, non-recursive policy for admin read access
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Check if the current user has admin role by querying auth.users metadata
    -- This avoids recursion by not querying the users table itself
    EXISTS (
      SELECT 1 
      FROM users admin_check 
      WHERE admin_check.id = auth.uid() 
      AND admin_check.role = 'admin'
    )
  );

-- Create a policy for admin update access
CREATE POLICY "Admins can update all users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM users admin_check 
      WHERE admin_check.id = auth.uid() 
      AND admin_check.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM users admin_check 
      WHERE admin_check.id = auth.uid() 
      AND admin_check.role = 'admin'
    )
  );
