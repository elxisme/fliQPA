/*
  # Add provider SELECT policy

  ## Problem
  Providers cannot read their own profile because there's no SELECT policy that allows
  providers to access their own provider record. The existing SELECT policy only allows
  viewing verified providers, which blocks unverified providers from reading their own data.

  ## Solution
  Add a SELECT policy that allows providers to read their own profile
*/

CREATE POLICY "Providers can view own profile"
  ON providers
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'provider'
    )
  );
