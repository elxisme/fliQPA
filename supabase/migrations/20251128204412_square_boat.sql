/*
  # Create Bookings Table

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to users)
      - `provider_id` (uuid, foreign key to users)
      - `service_id` (uuid, foreign key to services, nullable)
      - `category` (text, service category for quick queries)
      - `status` (text, booking status with check constraint)
      - `requested_start` (timestamptz, requested start time)
      - `requested_end` (timestamptz, requested end time)
      - `actual_start` (timestamptz, actual start time)
      - `actual_end` (timestamptz, actual end time)
      - `estimated_amount` (numeric, estimated cost)
      - `final_amount` (numeric, final cost)
      - `platform_fee` (numeric, platform commission)
      - `provider_payout` (numeric, provider earnings)
      - `paystack_charge_id` (text, payment reference)
      - `location` (text, service location)
      - `notes` (text, additional notes)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `bookings` table
    - Add policy for clients to manage their bookings
    - Add policy for providers to manage their bookings
    - Add policy for admins to manage all bookings

  3. Indexes
    - Index on client_id for client queries
    - Index on provider_id for provider queries
    - Index on status for filtering
    - Index on requested_start for scheduling
    - Composite indexes for common queries
*/

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES users(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES users(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  category text NOT NULL CHECK (category IN ('companion', 'bouncer', 'bodyguard', 'assistant')),
  status text NOT NULL CHECK (status IN (
    'REQUESTED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 
    'IN_SERVICE', 'COMPLETED', 'CANCELLED', 'DISPUTED'
  )),
  requested_start timestamptz NOT NULL,
  requested_end timestamptz NOT NULL,
  actual_start timestamptz,
  actual_end timestamptz,
  estimated_amount numeric(12,2) NOT NULL CHECK (estimated_amount >= 0),
  final_amount numeric(12,2) CHECK (final_amount >= 0),
  platform_fee numeric(12,2) CHECK (platform_fee >= 0),
  provider_payout numeric(12,2) CHECK (provider_payout >= 0),
  paystack_charge_id text,
  location text,
  notes text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (requested_end > requested_start),
  CONSTRAINT valid_actual_time_range CHECK (actual_end IS NULL OR actual_start IS NULL OR actual_end > actual_start)
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Clients can manage their own bookings
CREATE POLICY "Clients can manage own bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (client_id = auth.uid());

-- Providers can manage their own bookings
CREATE POLICY "Providers can manage own bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (provider_id = auth.uid());

-- Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_requested_start ON bookings(requested_start);
CREATE INDEX IF NOT EXISTS idx_bookings_category ON bookings(category);
CREATE INDEX IF NOT EXISTS idx_bookings_client_status ON bookings(client_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_status ON bookings(provider_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);