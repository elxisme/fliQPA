/*
  # Add Provider Service Settings Fields

  1. Changes
    - Add `min_booking_hours` column to providers table (default: 1)
    - Add `max_daily_bookings` column to providers table (optional)
  
  2. Purpose
    - min_booking_hours: Minimum hours required for any booking
    - max_daily_bookings: Maximum number of bookings provider accepts per day
  
  3. Notes
    - These settings apply to the provider's base service
    - Individual services can override min_booking_hours
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'providers' AND column_name = 'min_booking_hours'
  ) THEN
    ALTER TABLE providers ADD COLUMN min_booking_hours integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'providers' AND column_name = 'max_daily_bookings'
  ) THEN
    ALTER TABLE providers ADD COLUMN max_daily_bookings integer;
  END IF;
END $$;
