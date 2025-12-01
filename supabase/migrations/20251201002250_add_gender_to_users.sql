/*
  # Add gender field to users table

  1. Changes
    - Add `gender` column to users table
    - Gender is optional and can be: male, female, other, prefer_not_to_say
    - Default value is NULL (not specified)
  
  2. Security
    - No RLS changes needed as existing policies cover this field
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'gender'
  ) THEN
    ALTER TABLE users ADD COLUMN gender text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));
  END IF;
END $$;