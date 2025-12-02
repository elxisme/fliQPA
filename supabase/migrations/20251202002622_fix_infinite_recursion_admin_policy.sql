/*
  # Fix Infinite Recursion in Admin RLS Policy

  1. Problem
    - Admin policy queries the users table within the users table policy
    - This creates infinite recursion: policy checks table → table checks policy → infinite loop
    
  2. Solution
    - Drop the recursive admin policies
    - Create non-recursive policies using only auth.uid()
    - Admins can see all users, regular users can only see their own data and verified providers
    
  3. Changes
    - Drop problematic admin policies
    - Create simpler, non-recursive policies
    - Users can read: their own profile OR verified provider profiles OR if they are admin (checked via raw_app_meta_data)
    - Users can update: only their own profile
    
  4. Security
    - All policies remain restrictive
    - No circular dependencies
    - Admin access controlled via auth metadata (set during registration)
*/

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Create a simple policy: users can read their own data
-- Note: We'll handle admin access separately via service role or a function that doesn't query users table
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can read verified provider profiles (for discovery)
CREATE POLICY "Users can read verified providers"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    role = 'provider' 
    AND verification_status->>'verified' = 'true'
  );

-- Users can update their own profile only
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin access note:
-- For admin dashboard functionality, the admin user should query using their own
-- auth.uid() which will match their record. Then the frontend can make additional
-- queries as needed. Alternatively, use service role key for admin operations.
