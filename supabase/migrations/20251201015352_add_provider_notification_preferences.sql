/*
  # Add Provider Notification Preferences

  1. New Tables
    - `notification_preferences`
      - `id` (uuid, primary key)
      - `provider_id` (uuid, foreign key to providers.id)
      - `booking_requests` (boolean, default true) - REQUIRED notification
      - `new_messages` (boolean, default true)
      - `payment_received` (boolean, default true)
      - `system_updates` (boolean, default true)
      - `dispute_alerts` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `notification_preferences` table
    - Add policy for providers to read their own notification preferences
    - Add policy for providers to update their own notification preferences
    - Add policy for providers to insert their own notification preferences

  3. Notes
    - Each provider can have only one notification preferences record
    - `booking_requests` is always true and cannot be disabled (required)
    - Automatic timestamp updates on modification
*/

CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE UNIQUE NOT NULL,
  booking_requests boolean DEFAULT true NOT NULL,
  new_messages boolean DEFAULT true NOT NULL,
  payment_received boolean DEFAULT true NOT NULL,
  system_updates boolean DEFAULT true NOT NULL,
  dispute_alerts boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view their own notification preferences"
  ON notification_preferences
  FOR SELECT
  TO authenticated
  USING (
    provider_id IN (
      SELECT id FROM providers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can insert their own notification preferences"
  ON notification_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (
    provider_id IN (
      SELECT id FROM providers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can update their own notification preferences"
  ON notification_preferences
  FOR UPDATE
  TO authenticated
  USING (
    provider_id IN (
      SELECT id FROM providers WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    provider_id IN (
      SELECT id FROM providers WHERE user_id = auth.uid()
    )
    AND booking_requests = true
  );

CREATE INDEX IF NOT EXISTS idx_notification_preferences_provider_id 
  ON notification_preferences(provider_id);

CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_preferences_timestamp
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();