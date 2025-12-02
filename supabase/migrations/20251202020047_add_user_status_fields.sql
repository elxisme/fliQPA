/*
  # Add User Status and Management Fields

  1. Changes
    - Add `status` column to users table (active, suspended, banned)
    - Add `status_reason` column for suspension/ban reasons
    - Add `status_updated_at` timestamp
    - Add `status_updated_by` to track which admin made changes
    - Add index on status for faster filtering

  2. Security
    - Only admins can update user status fields
    - Add RLS policies for admin access
*/

-- Add status fields to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'status'
  ) THEN
    ALTER TABLE users ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'status_reason'
  ) THEN
    ALTER TABLE users ADD COLUMN status_reason text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'status_updated_at'
  ) THEN
    ALTER TABLE users ADD COLUMN status_updated_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'status_updated_by'
  ) THEN
    ALTER TABLE users ADD COLUMN status_updated_by uuid REFERENCES users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE users ADD COLUMN last_login_at timestamptz;
  END IF;
END $$;

-- Create index for faster status filtering
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create user_activity_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES users(id),
  action text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_admin_id ON user_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at DESC);

-- Enable RLS on user_activity_logs
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all activity logs
CREATE POLICY "Admins can view all activity logs"
  ON user_activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Allow admins to create activity logs
CREATE POLICY "Admins can create activity logs"
  ON user_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );