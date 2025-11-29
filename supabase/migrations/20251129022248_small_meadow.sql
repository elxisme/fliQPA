/*
  # Fix RLS Performance and Security Issues

  This migration addresses multiple security and performance issues:

  1. **RLS Performance**: Replace auth.uid() with (select auth.uid()) to prevent re-evaluation
  2. **Policy Consolidation**: Merge overlapping policies to reduce complexity
  3. **Index Cleanup**: Remove unused indexes and duplicates
  4. **Function Security**: Fix search_path vulnerabilities
  5. **Access Control**: Streamline permission structure

  ## Changes Made
  - Optimized all RLS policies for performance
  - Consolidated duplicate policies
  - Removed unused indexes
  - Fixed function security issues
  - Maintained all existing functionality
*/

-- First, drop all existing policies to rebuild them optimally
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all existing policies
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Remove unused and duplicate indexes
DROP INDEX IF EXISTS idx_disputes_evidence;
DROP INDEX IF EXISTS idx_disputes_booking_id;
DROP INDEX IF EXISTS idx_disputes_raised_by;
DROP INDEX IF EXISTS idx_disputes_status;
DROP INDEX IF EXISTS idx_disputes_created_at;
DROP INDEX IF EXISTS idx_disputes_resolved_by;
DROP INDEX IF EXISTS idx_bookings_client_status_date;
DROP INDEX IF EXISTS idx_bookings_category_status;
DROP INDEX IF EXISTS idx_bookings_date_range;
DROP INDEX IF EXISTS idx_providers_category;
DROP INDEX IF EXISTS idx_providers_rating;
DROP INDEX IF EXISTS idx_providers_category_rating;
DROP INDEX IF EXISTS idx_reviews_booking_id;
DROP INDEX IF EXISTS idx_reviews_reviewer_id;
DROP INDEX IF EXISTS idx_reviews_reviewee_id;
DROP INDEX IF EXISTS idx_services_provider_id;
DROP INDEX IF EXISTS idx_services_active;
DROP INDEX IF EXISTS idx_services_extras;
DROP INDEX IF EXISTS idx_reviews_rating;
DROP INDEX IF EXISTS idx_reviews_created_at;
DROP INDEX IF EXISTS idx_services_active_provider;
DROP INDEX IF EXISTS idx_services_extras_gin;
DROP INDEX IF EXISTS idx_notifications_data_gin;
DROP INDEX IF EXISTS idx_providers_bio_search;
DROP INDEX IF EXISTS idx_services_title_search;
DROP INDEX IF EXISTS idx_bookings_client_id;
DROP INDEX IF EXISTS idx_bookings_provider_id;
DROP INDEX IF EXISTS idx_bookings_service_id;
DROP INDEX IF EXISTS idx_bookings_status;
DROP INDEX IF EXISTS idx_bookings_requested_start;
DROP INDEX IF EXISTS idx_bookings_category;
DROP INDEX IF EXISTS idx_bookings_client_status;
DROP INDEX IF EXISTS idx_bookings_provider_status;
DROP INDEX IF EXISTS idx_bookings_created_at;
DROP INDEX IF EXISTS idx_provider_availability_provider_id;
DROP INDEX IF EXISTS idx_provider_availability_day_of_week;
DROP INDEX IF EXISTS idx_provider_availability_is_available;
DROP INDEX IF EXISTS idx_wallets_user_id;
DROP INDEX IF EXISTS idx_wallet_transactions_wallet_id;
DROP INDEX IF EXISTS idx_wallet_transactions_booking_id;
DROP INDEX IF EXISTS idx_wallet_transactions_type;
DROP INDEX IF EXISTS idx_wallet_transactions_created_at;
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_type;
DROP INDEX IF EXISTS idx_notifications_read;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_user_read;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_city;
DROP INDEX IF EXISTS idx_users_verification;

-- Create essential indexes only
CREATE INDEX IF NOT EXISTS idx_bookings_provider_status_active ON bookings(provider_id, status) WHERE status IN ('REQUESTED', 'ACCEPTED', 'IN_SERVICE');
CREATE INDEX IF NOT EXISTS idx_bookings_client_recent ON bookings(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_providers_category ON providers(category);
CREATE INDEX IF NOT EXISTS idx_services_provider_active ON services(provider_id) WHERE active = true;

-- Fix function security by setting search_path
ALTER FUNCTION update_wallet_timestamp() SET search_path = '';
ALTER FUNCTION create_user_wallet() SET search_path = '';
ALTER FUNCTION is_admin() SET search_path = '';
ALTER FUNCTION update_provider_rating() SET search_path = '';
ALTER FUNCTION handle_booking_status_change() SET search_path = '';
ALTER FUNCTION prevent_double_booking() SET search_path = '';
ALTER FUNCTION expire_old_booking_requests() SET search_path = '';
ALTER FUNCTION validate_booking_times() SET search_path = '';
ALTER FUNCTION calculate_booking_amounts() SET search_path = '';
ALTER FUNCTION create_booking_notifications() SET search_path = '';
ALTER FUNCTION create_review_notifications() SET search_path = '';
ALTER FUNCTION cleanup_old_notifications() SET search_path = '';
ALTER FUNCTION search_providers() SET search_path = '';
ALTER FUNCTION get_provider_availability() SET search_path = '';
ALTER FUNCTION get_booking_stats() SET search_path = '';
ALTER FUNCTION refresh_provider_rankings() SET search_path = '';
ALTER FUNCTION validate_wallet_balance() SET search_path = '';

-- Create optimized RLS policies

-- Users table policies
CREATE POLICY "admin_all_users" ON users
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "users_own_data" ON users
  FOR ALL TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "view_verified_providers" ON users
  FOR SELECT TO authenticated
  USING (
    role = 'provider' AND 
    COALESCE((verification_status->>'verified')::boolean, false) = true
  );

-- Providers table policies
CREATE POLICY "admin_all_providers" ON providers
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "providers_own_profile" ON providers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.id = providers.user_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid()) 
      AND u.id = providers.user_id 
      AND u.role = 'provider'
    )
  );

CREATE POLICY "view_verified_providers_public" ON providers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = providers.user_id 
      AND users.role = 'provider'
      AND COALESCE((users.verification_status->>'verified')::boolean, false) = true
    )
  );

-- Services table policies
CREATE POLICY "admin_all_services" ON services
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "providers_own_services" ON services
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = services.provider_id 
      AND u.id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = services.provider_id 
      AND u.id = (select auth.uid())
    )
  );

CREATE POLICY "view_active_services" ON services
  FOR SELECT TO authenticated
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

-- Bookings table policies
CREATE POLICY "admin_all_bookings" ON bookings
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "clients_own_bookings" ON bookings
  FOR ALL TO authenticated
  USING (client_id = (select auth.uid()))
  WITH CHECK (client_id = (select auth.uid()));

CREATE POLICY "providers_own_bookings" ON bookings
  FOR ALL TO authenticated
  USING (provider_id = (select auth.uid()))
  WITH CHECK (provider_id = (select auth.uid()));

-- Provider availability table policies
CREATE POLICY "admin_all_availability" ON provider_availability
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "providers_own_availability" ON provider_availability
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = provider_availability.provider_id 
      AND u.id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = provider_availability.provider_id 
      AND u.id = (select auth.uid())
    )
  );

CREATE POLICY "view_provider_availability" ON provider_availability
  FOR SELECT TO authenticated
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

-- Wallets table policies
CREATE POLICY "admin_all_wallets" ON wallets
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "users_own_wallet" ON wallets
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Wallet transactions table policies
CREATE POLICY "admin_all_transactions" ON wallet_transactions
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "users_own_transactions" ON wallet_transactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = wallet_transactions.wallet_id 
      AND wallets.user_id = (select auth.uid())
    )
  );

CREATE POLICY "system_insert_transactions" ON wallet_transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = wallet_transactions.wallet_id 
      AND wallets.user_id = (select auth.uid())
    ) OR is_admin()
  );

-- Reviews table policies
CREATE POLICY "admin_all_reviews" ON reviews
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "users_own_reviews" ON reviews
  FOR ALL TO authenticated
  USING (
    reviewee_id = (select auth.uid()) OR 
    reviewer_id = (select auth.uid())
  )
  WITH CHECK (
    reviewer_id = (select auth.uid()) AND
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = reviews.booking_id 
      AND b.status = 'COMPLETED'
      AND (b.client_id = (select auth.uid()) OR b.provider_id = (select auth.uid()))
      AND b.actual_end < (now() - interval '1 hour')
    )
  );

CREATE POLICY "view_provider_reviews" ON reviews
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = reviews.reviewee_id 
      AND users.role = 'provider'
      AND COALESCE((users.verification_status->>'verified')::boolean, false) = true
    )
  );

-- Disputes table policies
CREATE POLICY "admin_all_disputes" ON disputes
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "users_own_disputes" ON disputes
  FOR ALL TO authenticated
  USING (
    raised_by = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = disputes.booking_id 
      AND (b.client_id = (select auth.uid()) OR b.provider_id = (select auth.uid()))
    )
  )
  WITH CHECK (
    raised_by = (select auth.uid()) AND
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = disputes.booking_id 
      AND (b.client_id = (select auth.uid()) OR b.provider_id = (select auth.uid()))
    )
  );

-- Notifications table policies
CREATE POLICY "admin_all_notifications" ON notifications
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "users_own_notifications" ON notifications
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));