/*
  # Provider Status and Location Settings

  ## Overview
  Adds provider online/offline status, working days preferences, vacation mode, and location settings.

  ## Changes
  
  ### Update `providers` table
  - `is_online` (boolean) - Provider's current availability status
  - `vacation_mode` (boolean) - Whether provider is on vacation
  - `working_days` (jsonb) - Working days preferences

  ### New Table: `provider_location_settings`
  - `id` (uuid, primary key)
  - `provider_id` (uuid, references providers.id)
  - `gps_tracking_enabled` (boolean) - Whether live GPS tracking is on
  - `current_latitude` (numeric) - Current GPS latitude
  - `current_longitude` (numeric) - Current GPS longitude
  - `service_radius_km` (integer) - Maximum service radius (1-10 km)
  - `last_location_update` (timestamptz) - When GPS was last updated
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - RLS enabled on location settings table
  - Providers can only read/update their own location settings
  - Clients can read provider location settings (for distance calculation)

  ## Notes
  - `working_days` structure: [{"day": "monday", "enabled": true, "start": "09:00", "end": "17:00"}, ...]
  - GPS coordinates stored as numeric for precision
  - Service radius is capped at 10km maximum
  - If `is_online` is false, provider won't show in search results
  - If `vacation_mode` is true, provider is completely unavailable
*/

-- Add new columns to providers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'providers' AND column_name = 'is_online'
  ) THEN
    ALTER TABLE providers ADD COLUMN is_online boolean DEFAULT true NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'providers' AND column_name = 'vacation_mode'
  ) THEN
    ALTER TABLE providers ADD COLUMN vacation_mode boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'providers' AND column_name = 'working_days'
  ) THEN
    ALTER TABLE providers ADD COLUMN working_days jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create provider_location_settings table
CREATE TABLE IF NOT EXISTS provider_location_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  gps_tracking_enabled boolean DEFAULT false NOT NULL,
  current_latitude numeric(10, 7),
  current_longitude numeric(10, 7),
  service_radius_km integer DEFAULT 5 CHECK (service_radius_km >= 1 AND service_radius_km <= 10),
  last_location_update timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(provider_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_providers_is_online ON providers(is_online);
CREATE INDEX IF NOT EXISTS idx_providers_vacation_mode ON providers(vacation_mode);
CREATE INDEX IF NOT EXISTS idx_provider_location_provider_id ON provider_location_settings(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_location_gps_enabled ON provider_location_settings(gps_tracking_enabled);
CREATE INDEX IF NOT EXISTS idx_provider_location_coords ON provider_location_settings(current_latitude, current_longitude);

-- Enable RLS on location settings
ALTER TABLE provider_location_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for provider_location_settings

-- Providers can read their own location settings
CREATE POLICY "Providers can read own location settings"
  ON provider_location_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM providers
      WHERE providers.id = provider_location_settings.provider_id
      AND providers.user_id = auth.uid()
    )
  );

-- Providers can insert their own location settings
CREATE POLICY "Providers can insert own location settings"
  ON provider_location_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM providers
      WHERE providers.id = provider_location_settings.provider_id
      AND providers.user_id = auth.uid()
    )
  );

-- Providers can update their own location settings
CREATE POLICY "Providers can update own location settings"
  ON provider_location_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM providers
      WHERE providers.id = provider_location_settings.provider_id
      AND providers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM providers
      WHERE providers.id = provider_location_settings.provider_id
      AND providers.user_id = auth.uid()
    )
  );

-- Clients can read provider location settings (for distance calculation)
CREATE POLICY "Clients can read provider location settings"
  ON provider_location_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'client'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on location settings
DROP TRIGGER IF EXISTS update_provider_location_settings_updated_at ON provider_location_settings;
CREATE TRIGGER update_provider_location_settings_updated_at
  BEFORE UPDATE ON provider_location_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();