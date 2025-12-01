/*
  # Fix Users-Providers Relationship

  1. Changes
    - Add unique constraint on providers.user_id to enforce one-to-one relationship
    - Refresh foreign key constraint to ensure schema cache is updated
    - Add helpful comments for relationship clarity

  2. Notes
    - This migration ensures the relationship between users and providers is properly recognized
    - The unique constraint on user_id ensures each user can only have one provider profile
*/

-- Ensure the foreign key constraint exists and is properly named
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'providers_user_id_fkey' 
    AND table_name = 'providers'
  ) THEN
    ALTER TABLE providers 
    ADD CONSTRAINT providers_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add unique constraint on user_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'providers_user_id_unique'
    AND table_name = 'providers'
  ) THEN
    ALTER TABLE providers ADD CONSTRAINT providers_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- Refresh the schema cache by analyzing the tables
ANALYZE users;
ANALYZE providers;

-- Add comment to document the relationship
COMMENT ON CONSTRAINT providers_user_id_fkey ON providers IS 'One-to-one relationship: each user can have at most one provider profile';
