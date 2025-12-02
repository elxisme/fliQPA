/*
  # Add age field to users table

  1. Changes
    - Add `age` column to users table
    - Age is optional (nullable)
    - Stored as integer representing years
  
  2. Security
    - No RLS changes needed as existing policies cover this field
  
  3. Notes
    - Age is used for display purposes in provider listings
    - Providers can optionally provide their age during onboarding or in settings
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'age'
  ) THEN
    ALTER TABLE users ADD COLUMN age integer CHECK (age >= 18 AND age <= 100);
  END IF;
END $$;
