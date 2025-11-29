/*
  # Create Disputes Table

  1. New Tables
    - `disputes`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, foreign key to bookings)
      - `raised_by` (uuid, foreign key to users)
      - `reason` (text, dispute reason)
      - `evidence` (jsonb, evidence files and descriptions)
      - `status` (text, dispute status)
      - `resolution` (jsonb, admin resolution details)
      - `resolved_by` (uuid, foreign key to users, nullable)
      - `resolved_at` (timestamptz, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `disputes` table
    - Add policy for users to view their own disputes
    - Add policy for admins to manage all disputes

  3. Indexes
    - Index on booking_id for dispute lookups
    - Index on raised_by for user queries
    - Index on status for filtering
    - Index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  raised_by uuid REFERENCES users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  evidence jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'REJECTED')),
  resolution jsonb,
  resolved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Users can view disputes they raised or are involved in
CREATE POLICY "Users can view own disputes"
  ON disputes
  FOR SELECT
  TO authenticated
  USING (
    raised_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = disputes.booking_id 
      AND (b.client_id = auth.uid() OR b.provider_id = auth.uid())
    )
  );

-- Users can create disputes for their bookings
CREATE POLICY "Users can create disputes for own bookings"
  ON disputes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    raised_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = disputes.booking_id 
      AND (b.client_id = auth.uid() OR b.provider_id = auth.uid())
    )
  );

-- Admins can manage all disputes
CREATE POLICY "Admins can manage all disputes"
  ON disputes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_disputes_booking_id ON disputes(booking_id);
CREATE INDEX IF NOT EXISTS idx_disputes_raised_by ON disputes(raised_by);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_created_at ON disputes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_disputes_resolved_by ON disputes(resolved_by);
CREATE INDEX IF NOT EXISTS idx_disputes_evidence ON disputes USING GIN(evidence);