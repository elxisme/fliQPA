/*
  # Create Users Table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email` (text, unique)
      - `phone` (text, unique)
      - `role` (text, check constraint for client/provider/admin)
      - `city` (text)
      - `paystack_subaccount_id` (text, nullable)
      - `profile_base_price` (numeric, for providers)
      - `verification_status` (jsonb, for badges and verification info)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `users` table
    - Add policies for users to read/update their own data
    - Add policy for admins to manage all users
    - Add policy for clients to view verified providers

  3. Indexes
    - Index on email for fast lookups
    - Index on role for filtering
    - Index on city for location-based searches
    - Composite index on role and city for provider searches
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE,
  phone text UNIQUE,
  role text NOT NULL CHECK (role IN ('client', 'provider', 'admin')),
  city text,
  paystack_subaccount_id text,
  profile_base_price numeric(10,2),
  verification_status jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Clients can view verified providers
CREATE POLICY "Clients can view verified providers"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    role = 'provider' AND 
    (verification_status->>'verified')::boolean = true
  );

-- Admins can manage all users
CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_role_city ON users(role, city);
CREATE INDEX IF NOT EXISTS idx_users_verification ON users USING GIN(verification_status);