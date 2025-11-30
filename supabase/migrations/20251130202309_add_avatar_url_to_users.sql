/*
  # Add Avatar URL to Users Table

  1. Changes
    - Add `avatar_url` column to `users` table to store profile picture URLs
    - Column is nullable to support existing users without avatars
    
  2. Security
    - No RLS changes needed as users table already has appropriate policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar_url text;
  END IF;
END $$;