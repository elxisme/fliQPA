/*
  # Add Missing RLS Policies

  ## Security Enhancements
  
  This migration adds comprehensive RLS policies that were missing from the initial setup.
  All tables now have complete CRUD policies with proper access control.

  ## Changes by Table

  ### 1. bookings
  - Add admin policy for all operations (was missing)
  
  ### 2. providers  
  - Add SELECT policy for clients to view verified providers
  - Add UPDATE/DELETE policies for providers to manage own profile
  - Add admin policy for all operations
  
  ### 3. services
  - Add SELECT policy for authenticated users to view active services
  - Add UPDATE/DELETE policies for providers to manage own services
  - Add admin policy for all operations
  
  ### 4. provider_availability
  - Add SELECT policy for clients to view availability
  - Add UPDATE/DELETE policies for providers to manage own availability
  - Add admin policy for all operations
  
  ### 5. disputes
  - Add UPDATE policy for users involved in disputes
  - Add admin policy for all operations (was partially missing)
  
  ### 6. reviews
  - Add SELECT policy for public to view provider reviews
  - Add admin policy for all operations
  
  ### 7. wallets
  - Add DELETE policy (prevent deletion by users, admin only)
  - Add admin policy for all operations
  
  ### 8. wallet_transactions
  - Add INSERT policy for system operations
  - Add UPDATE/DELETE policies (admin only)
  - Add admin policy for all operations

  ### 9. notifications
  - Add SELECT policy for users to view own notifications
  - Add UPDATE policy for users to mark as read
  - Add DELETE policy (admin only)

  ## Security Notes
  
  - All policies follow principle of least privilege
  - Admins have full access to all tables
  - Users can only access their own data
  - Clients can view verified providers and their services
  - All financial operations are properly restricted
  - Disputes can only be created/updated by involved parties
*/

-- ============================================================================
-- BOOKINGS TABLE - Add missing admin policy
-- ============================================================================

CREATE POLICY "Admins can manage all bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- PROVIDERS TABLE - Add missing policies
-- ============================================================================

-- Clients can view verified providers
CREATE POLICY "Clients can view verified providers"
  ON providers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = providers.user_id 
      AND role = 'provider' 
      AND COALESCE((verification_status->>'verified')::boolean, false) = true
    )
  );

-- Providers can update their own profile
CREATE POLICY "Providers can update own profile"
  ON providers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND id = providers.user_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND id = providers.user_id
    )
  );

-- Providers can delete their own profile
CREATE POLICY "Providers can delete own profile"
  ON providers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND id = providers.user_id
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

-- ============================================================================
-- SERVICES TABLE - Add missing policies
-- ============================================================================

-- Authenticated users can view active services from verified providers
CREATE POLICY "Users can view active services"
  ON services
  FOR SELECT
  TO authenticated
  USING (
    active = true AND
    EXISTS (
      SELECT 1 FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = services.provider_id 
      AND u.role = 'provider'
      AND COALESCE((u.verification_status->>'verified')::boolean, false) = true
    )
  );

-- Providers can update their own services
CREATE POLICY "Providers can update own services"
  ON services
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = services.provider_id AND u.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = services.provider_id AND u.id = auth.uid()
    )
  );

-- Providers can delete their own services
CREATE POLICY "Providers can delete own services"
  ON services
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = services.provider_id AND u.id = auth.uid()
    )
  );

-- Admins can manage all services
CREATE POLICY "Admins can manage all services"
  ON services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- PROVIDER_AVAILABILITY TABLE - Add missing policies
-- ============================================================================

-- Clients can view availability of verified providers
CREATE POLICY "Clients can view provider availability"
  ON provider_availability
  FOR SELECT
  TO authenticated
  USING (
    is_available = true AND
    EXISTS (
      SELECT 1 FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = provider_availability.provider_id 
      AND u.role = 'provider'
      AND COALESCE((u.verification_status->>'verified')::boolean, false) = true
    )
  );

-- Providers can update their own availability
CREATE POLICY "Providers can update own availability"
  ON provider_availability
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = provider_availability.provider_id AND u.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = provider_availability.provider_id AND u.id = auth.uid()
    )
  );

-- Providers can delete their own availability
CREATE POLICY "Providers can delete own availability"
  ON provider_availability
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = provider_availability.provider_id AND u.id = auth.uid()
    )
  );

-- Admins can manage all availability
CREATE POLICY "Admins can manage all availability"
  ON provider_availability
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- DISPUTES TABLE - Add missing policies
-- ============================================================================

-- Users can update disputes they're involved in (for providing additional evidence)
CREATE POLICY "Users can update own disputes"
  ON disputes
  FOR UPDATE
  TO authenticated
  USING (
    raised_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = disputes.booking_id 
      AND (b.client_id = auth.uid() OR b.provider_id = auth.uid())
    )
  )
  WITH CHECK (
    raised_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = disputes.booking_id 
      AND (b.client_id = auth.uid() OR b.provider_id = auth.uid())
    )
  );

-- Admins can manage all disputes (including resolution)
CREATE POLICY "Admins can manage all disputes"
  ON disputes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- REVIEWS TABLE - Add missing policies
-- ============================================================================

-- Public can view provider reviews (for verified providers)
CREATE POLICY "Public can view provider reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = reviews.reviewee_id 
      AND role = 'provider'
      AND COALESCE((verification_status->>'verified')::boolean, false) = true
    )
  );

-- Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews"
  ON reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- WALLETS TABLE - Add missing policies
-- ============================================================================

-- Prevent users from deleting wallets (admin only)
CREATE POLICY "Only admins can delete wallets"
  ON wallets
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage all wallets
CREATE POLICY "Admins can manage all wallets"
  ON wallets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- WALLET_TRANSACTIONS TABLE - Add missing policies
-- ============================================================================

-- System can insert transactions (for booking-related operations)
CREATE POLICY "System can insert wallet transactions"
  ON wallet_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wallets 
      WHERE id = wallet_transactions.wallet_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update transactions (prevent fraud)
CREATE POLICY "Only admins can update transactions"
  ON wallet_transactions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete transactions (prevent fraud)
CREATE POLICY "Only admins can delete transactions"
  ON wallet_transactions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage all transactions
CREATE POLICY "Admins can manage all transactions"
  ON wallet_transactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- NOTIFICATIONS TABLE - Add missing policies
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Only admins can delete notifications
CREATE POLICY "Only admins can delete notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage all notifications
CREATE POLICY "Admins can manage all notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
