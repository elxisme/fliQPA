/*
  # Fix Admin RLS Policy for Users Table

  1. Issue
    - The current "Admins can manage all users" policy uses is_admin() function
    - This function checks JWT claims that are never set in the application
    - Admin users cannot see the users list in the admin dashboard
  
  2. Solution
    - Replace the is_admin() check with a direct query to the users table
    - Check if the current user has role = 'admin' in the users table
    - This allows admins to see and manage all users
  
  3. Security
    - Policy remains restrictive: only users with admin role can access all users
    - Non-admin authenticated users can only see verified providers or their own data
*/

DROP POLICY IF EXISTS "Admins can manage all users" ON users;

CREATE POLICY "Admins can manage all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
