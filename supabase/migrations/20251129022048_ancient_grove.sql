/*
  # Fix RLS Performance and Security Issues

  This migration addresses multiple security and performance issues:

  1. RLS Performance Issues
     - Replace auth.uid() with (select auth.uid()) in all policies for better performance
     - Consolidate duplicate policies where possible

  2. Index Cleanup
     - Remove unused indexes to improve write performance
     - Remove duplicate indexes

  3. Function Security
     - Set proper search_path for all functions to prevent injection attacks

  4. Policy Consolidation
     - Merge overlapping policies to reduce complexity
*/

-- First, drop all existing policies that need to be recreated with optimized auth calls
-- We'll recreate them with proper (select auth.uid()) syntax

-- Users table policies
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Clients can view verified providers" ON users;

-- Providers table policies
DROP POLICY IF EXISTS "Providers can insert own profile" ON providers;
DROP POLICY IF EXISTS "Providers can update own profile" ON providers;
DROP POLICY IF EXISTS "Providers can delete own profile" ON providers;
DROP POLICY IF EXISTS "Admins can manage all providers" ON providers;
DROP POLICY IF EXISTS "Clients can view verified providers" ON providers;

-- Services table policies
DROP POLICY IF EXISTS "Providers can insert own services" ON services;
DROP POLICY IF EXISTS "Providers can update own services" ON services;
DROP POLICY IF EXISTS "Providers can delete own services" ON services;
DROP POLICY IF EXISTS "Admins can manage all services" ON services;
DROP POLICY IF EXISTS "Users can view active services" ON services;

-- Bookings table policies
DROP POLICY IF EXISTS "Clients can insert own bookings" ON bookings;
DROP POLICY IF EXISTS "Providers can insert own bookings" ON bookings;
DROP POLICY IF EXISTS "Clients can manage own bookings" ON bookings;
DROP POLICY IF EXISTS "Providers can manage own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON bookings;

-- Provider availability policies
DROP POLICY IF EXISTS "Providers can insert own availability" ON provider_availability;
DROP POLICY IF EXISTS "Providers can update own availability" ON provider_availability;
DROP POLICY IF EXISTS "Providers can delete own availability" ON provider_availability;
DROP POLICY IF EXISTS "Admins can manage all availability" ON provider_availability;
DROP POLICY IF EXISTS "Clients can view provider availability" ON provider_availability;

-- Wallets table policies
DROP POLICY IF EXISTS "Users can insert own wallet" ON wallets;
DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
DROP POLICY IF EXISTS "Users can update own wallet" ON wallets;
DROP POLICY IF EXISTS "Only admins can delete wallets" ON wallets;
DROP POLICY IF EXISTS "Admins can manage all wallets" ON wallets;

-- Wallet transactions policies
DROP POLICY IF EXISTS "System can insert wallet transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Users can view own wallet transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Only admins can update transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Only admins can delete transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Admins can manage all transactions" ON wallet_transactions;

-- Notifications policies
DROP POLICY IF EXISTS "Admins can insert all notifications" ON notifications;
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Only admins can delete notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;

-- Reviews policies
DROP POLICY IF EXISTS "Users can create reviews for completed bookings" ON reviews;
DROP POLICY IF EXISTS "Users can view reviews about them" ON reviews;
DROP POLICY IF EXISTS "Public can view provider reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;

-- Disputes policies
DROP POLICY IF EXISTS "Users can create disputes for own bookings" ON disputes;
DROP POLICY IF EXISTS "Users can view own disputes" ON disputes;
DROP POLICY IF EXISTS "Users can update own disputes" ON disputes;
DROP POLICY IF EXISTS "Admins can manage all disputes" ON disputes;

-- Now recreate optimized policies with consolidated logic

-- Users table - consolidated policies
CREATE POLICY "users_admin_all" ON users
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "users_own_profile" ON users
  FOR ALL TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "users_view_verified_providers" ON users
  FOR SELECT TO authenticated
  USING (
    role = 'provider' AND 
    COALESCE(((verification_status ->> 'verified'::text))::boolean, false) = true
  );

-- Providers table - consolidated policies
CREATE POLICY "providers_admin_all" ON providers
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

CREATE POLICY "providers_view_verified" ON providers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = providers.user_id 
      AND users.role = 'provider' 
      AND COALESCE(((users.verification_status ->> 'verified'::text))::boolean, false) = true
    )
  );

-- Services table - consolidated policies
CREATE POLICY "services_admin_all" ON services
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "services_provider_own" ON services
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

CREATE POLICY "services_view_active" ON services
  FOR SELECT TO authenticated
  USING (
    active = true AND 
    EXISTS (
      SELECT 1 FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = services.provider_id 
      AND u.role = 'provider' 
      AND COALESCE(((u.verification_status ->> 'verified'::text))::boolean, false) = true
    )
  );

-- Bookings table - consolidated policies
CREATE POLICY "bookings_admin_all" ON bookings
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "bookings_client_own" ON bookings
  FOR ALL TO authenticated
  USING (client_id = (select auth.uid()))
  WITH CHECK (client_id = (select auth.uid()));

CREATE POLICY "bookings_provider_own" ON bookings
  FOR ALL TO authenticated
  USING (provider_id = (select auth.uid()))
  WITH CHECK (provider_id = (select auth.uid()));

-- Provider availability - consolidated policies
CREATE POLICY "availability_admin_all" ON provider_availability
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "availability_provider_own" ON provider_availability
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

CREATE POLICY "availability_view_active" ON provider_availability
  FOR SELECT TO authenticated
  USING (
    is_available = true AND 
    EXISTS (
      SELECT 1 FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = provider_availability.provider_id 
      AND u.role = 'provider' 
      AND COALESCE(((u.verification_status ->> 'verified'::text))::boolean, false) = true
    )
  );

-- Wallets - consolidated policies
CREATE POLICY "wallets_admin_all" ON wallets
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "wallets_user_own" ON wallets
  FOR SELECT, UPDATE, INSERT TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Wallet transactions - consolidated policies
CREATE POLICY "transactions_admin_all" ON wallet_transactions
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "transactions_user_view" ON wallet_transactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = wallet_transactions.wallet_id 
      AND wallets.user_id = (select auth.uid())
    )
  );

CREATE POLICY "transactions_system_insert" ON wallet_transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = wallet_transactions.wallet_id 
      AND wallets.user_id = (select auth.uid())
    ) OR is_admin()
  );

-- Notifications - consolidated policies
CREATE POLICY "notifications_admin_all" ON notifications
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "notifications_user_own" ON notifications
  FOR SELECT, UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Reviews - consolidated policies
CREATE POLICY "reviews_admin_all" ON reviews
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "reviews_user_create" ON reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    reviewer_id = (select auth.uid()) AND 
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = reviews.booking_id 
      AND b.status = 'COMPLETED' 
      AND (b.client_id = (select auth.uid()) OR b.provider_id = (select auth.uid())) 
      AND b.actual_end < (now() - '01:00:00'::interval)
    )
  );

CREATE POLICY "reviews_user_view" ON reviews
  FOR SELECT TO authenticated
  USING (
    reviewee_id = (select auth.uid()) OR 
    reviewer_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = reviews.reviewee_id 
      AND users.role = 'provider' 
      AND COALESCE(((users.verification_status ->> 'verified'::text))::boolean, false) = true
    )
  );

-- Disputes - consolidated policies
CREATE POLICY "disputes_admin_all" ON disputes
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "disputes_user_own" ON disputes
  FOR SELECT, UPDATE TO authenticated
  USING (
    raised_by = (select auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = disputes.booking_id 
      AND (b.client_id = (select auth.uid()) OR b.provider_id = (select auth.uid()))
    )
  )
  WITH CHECK (
    raised_by = (select auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = disputes.booking_id 
      AND (b.client_id = (select auth.uid()) OR b.provider_id = (select auth.uid()))
    )
  );

CREATE POLICY "disputes_user_create" ON disputes
  FOR INSERT TO authenticated
  WITH CHECK (
    raised_by = (select auth.uid()) AND 
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = disputes.booking_id 
      AND (b.client_id = (select auth.uid()) OR b.provider_id = (select auth.uid()))
    )
  );

-- Remove unused indexes to improve write performance
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

-- Keep only essential indexes for actual query patterns
CREATE INDEX IF NOT EXISTS idx_bookings_provider_status_essential ON bookings(provider_id, status) WHERE status IN ('REQUESTED', 'ACCEPTED', 'IN_SERVICE');
CREATE INDEX IF NOT EXISTS idx_bookings_client_status_essential ON bookings(client_id, status) WHERE status IN ('REQUESTED', 'ACCEPTED', 'IN_SERVICE', 'COMPLETED');
CREATE INDEX IF NOT EXISTS idx_users_role_verified ON users(role) WHERE role = 'provider' AND (verification_status->>'verified')::boolean = true;
CREATE INDEX IF NOT EXISTS idx_services_active_essential ON services(provider_id) WHERE active = true;

-- Fix function security by setting proper search_path
-- This prevents search_path injection attacks

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