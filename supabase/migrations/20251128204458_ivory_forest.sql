/*
  # Create Provider Availability Table

  1. New Tables
    - `provider_availability`
      - `id` (uuid, primary key)
      - `provider_id` (uuid, foreign key to providers)
      - `day_of_week` (integer, 0-6 for Sunday-Saturday)
      - `start_time` (time, availability start time)
      - `end_time` (time, availability end time)
      - `is_available` (boolean, availability status)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `provider_availability` table
    - Add policy for providers to manage their availability
    - Add policy for clients to view provider availability

  3. Indexes
    - Index on provider_id for availability lookups
    - Index on day_of_week for scheduling queries
    - Composite index on provider_id and day_of_week
*/

CREATE TABLE IF NOT EXISTS provider_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  UNIQUE(provider_id, day_of_week, start_time, end_time)
);

-- Enable RLS
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;

-- Providers can manage their own availability
CREATE POLICY "Providers can manage own availability"
  ON provider_availability
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = provider_availability.provider_id AND u.id = auth.uid()
    )
  );

-- Clients can view provider availability
CREATE POLICY "Clients can view provider availability"
  ON provider_availability
  FOR SELECT
  TO authenticated
  USING (
    is_available = true AND
    EXISTS (
      SELECT 1 FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = provider_availability.provider_id 
      AND u.role = 'provider'
      AND (u.verification_status->>'verified')::boolean = true
    )
  );

-- Admins can manage all availability
CREATE POLICY "Admins can manage all availability"
  ON provider_availability
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_provider_availability_provider_id ON provider_availability(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_availability_day_of_week ON provider_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_provider_availability_provider_day ON provider_availability(provider_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_provider_availability_is_available ON provider_availability(is_available);