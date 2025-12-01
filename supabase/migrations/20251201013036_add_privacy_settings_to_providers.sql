/*
  # Add Privacy Settings to Providers

  1. New Columns
    - `show_distance_to_clients` (boolean, default true)
      - Controls whether provider's distance is shown to clients in search results
    - `show_ratings` (boolean, default true)
      - Controls whether provider's ratings and reviews are visible on their profile

  2. Changes
    - Add two new boolean columns to the providers table with default values
    - These settings allow providers to control their profile visibility

  3. Notes
    - Defaults to true (visible) to maintain current behavior
    - Providers can toggle these settings from Privacy Settings section
*/

-- Add privacy settings columns to providers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'providers' AND column_name = 'show_distance_to_clients'
  ) THEN
    ALTER TABLE providers ADD COLUMN show_distance_to_clients boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'providers' AND column_name = 'show_ratings'
  ) THEN
    ALTER TABLE providers ADD COLUMN show_ratings boolean DEFAULT true;
  END IF;
END $$;
