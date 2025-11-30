/*
  # Fix providers INSERT policy

  ## Problem
  The current INSERT policy on providers table checks `providers.user_id` in the WITH CHECK clause,
  but this value doesn't exist yet during INSERT, causing the policy to always fail.

  ## Changes
  - Drop the existing faulty INSERT policy
  - Create a new INSERT policy that only validates:
    1. The authenticated user is inserting their own profile (NEW.user_id = auth.uid())
    2. The user has the 'provider' role
*/

-- Drop the faulty INSERT policy
DROP POLICY IF EXISTS "Providers can insert own profile" ON providers;

-- Create correct INSERT policy
CREATE POLICY "Providers can insert own profile"
  ON providers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'provider'
    )
  );
