/*
  # Fix Services SELECT Policy for Providers

  1. Issue
    - Providers cannot see their own services because the current SELECT policy requires verification status to be true
    - Services exist in the database but aren't visible to the provider who created them
  
  2. Solution
    - Drop the overly restrictive "Users can view active services" policy
    - Add separate policies:
      - Providers can view their own services (regardless of verification)
      - Clients can view verified providers' active services
      - Admins can view all services
*/

DROP POLICY IF EXISTS "Users can view active services" ON services;

CREATE POLICY "Providers can view own services"
  ON services FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = services.provider_id
      AND u.id = auth.uid()
    )
  );

CREATE POLICY "Clients can view verified providers services"
  ON services FOR SELECT
  TO authenticated
  USING (
    (active = true) AND
    EXISTS (
      SELECT 1 FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = services.provider_id
      AND u.role = 'provider'
      AND COALESCE((u.verification_status ->> 'verified')::boolean, false) = true
    )
  );
