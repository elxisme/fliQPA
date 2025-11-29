/*
  # Create Providers Table

  1. New Tables
    - `providers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `category` (text, service category)
      - `bio` (text, provider description)
      - `rating` (numeric, average rating)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `providers` table
    - Add policy for providers to manage their own profile
    - Add policy for clients to view provider profiles
    - Add policy for admins to manage all providers

  3. Indexes
    - Index on user_id for joins
    - Index on category for filtering
    - Index on rating for sorting
    - Composite index on category and rating
*/

CREATE TABLE IF NOT EXISTS providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('companion', 'bouncer', 'bodyguard', 'assistant')),
  bio text,
  rating numeric(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Providers can manage their own profile
CREATE POLICY "Providers can manage own profile"
  ON providers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND id = providers.user_id
    )
  );

-- Clients can view provider profiles
CREATE POLICY "Clients can view provider profiles"
  ON providers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = providers.user_id 
      AND role = 'provider' 
      AND (verification_status->>'verified')::boolean = true
    )
  );

-- Admins can manage all providers
CREATE POLICY "Admins can manage all providers"
  ON providers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_category ON providers(category);
CREATE INDEX IF NOT EXISTS idx_providers_rating ON providers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_providers_category_rating ON providers(category, rating DESC);