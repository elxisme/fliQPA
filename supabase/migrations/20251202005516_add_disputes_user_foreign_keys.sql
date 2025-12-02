/*
  # Add Foreign Key Relationships to Disputes Table

  1. Changes
    - Add foreign key constraint from `disputes.raised_by` to `users.id`
    - Add foreign key constraint from `disputes.resolved_by` to `users.id`
    - These constraints allow queries to join disputes with user data
  
  2. Security
    - No changes to RLS policies
    - Maintains existing security model
*/

-- Add foreign key for raised_by column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'disputes_raised_by_fkey'
    AND table_name = 'disputes'
  ) THEN
    ALTER TABLE disputes
      ADD CONSTRAINT disputes_raised_by_fkey
      FOREIGN KEY (raised_by)
      REFERENCES users(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Add foreign key for resolved_by column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'disputes_resolved_by_fkey'
    AND table_name = 'disputes'
  ) THEN
    ALTER TABLE disputes
      ADD CONSTRAINT disputes_resolved_by_fkey
      FOREIGN KEY (resolved_by)
      REFERENCES users(id)
      ON DELETE SET NULL;
  END IF;
END $$;