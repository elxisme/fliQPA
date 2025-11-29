/*
  # Create Services Table

  1. New Tables
    - `services`
      - `id` (uuid, primary key)
      - `provider_id` (uuid, foreign key to providers)
      - `title` (text, service name)
      - `description` (text, service description)
      - `price_hour` (numeric, hourly rate)
      - `price_day` (numeric, daily rate)
      - `price_week` (numeric, weekly rate)
      - `min_booking_hours` (integer, minimum booking duration)
      - `extras` (jsonb, additional services)
      - `active` (boolean, service availability)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `services` table
    - Add policy for providers to manage their own services
    - Add policy for clients to view active services
    - Add policy for admins to manage all services

  3. Indexes
    - Index on provider_id for joins
    - Index on active status for filtering
    - Composite index on provider_id and active
*/

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  price_hour numeric(10,2),
  price_day numeric(10,2),
  price_week numeric(10,2),
  min_booking_hours int DEFAULT 1 CHECK (min_booking_hours > 0),
  extras jsonb DEFAULT '[]'::jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT at_least_one_price CHECK (
    price_hour IS NOT NULL OR price_day IS NOT NULL OR price_week IS NOT NULL
  )
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Providers can manage their own services
CREATE POLICY "Providers can manage own services"
  ON services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = services.provider_id AND u.id = auth.uid()
    )
  );

-- Clients can view active services
CREATE POLICY "Clients can view active services"
  ON services
  FOR SELECT
  TO authenticated
  USING (
    active = true AND
    EXISTS (
      SELECT 1 FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = services.provider_id 
      AND u.role = 'provider'
      AND (u.verification_status->>'verified')::boolean = true
    )
  );

-- Admins can manage all services
CREATE POLICY "Admins can manage all services"
  ON services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_services_provider_id ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);
CREATE INDEX IF NOT EXISTS idx_services_provider_active ON services(provider_id, active);
CREATE INDEX IF NOT EXISTS idx_services_extras ON services USING GIN(extras);