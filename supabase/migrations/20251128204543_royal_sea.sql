/*
  # Additional Performance Indexes and Optimizations

  1. Composite Indexes
    - Multi-column indexes for common query patterns
    - Partial indexes for filtered queries
    - GIN indexes for JSONB columns

  2. Performance Functions
    - Materialized views for analytics
    - Optimized search functions
    - Caching strategies

  3. Database Constraints
    - Additional check constraints
    - Foreign key optimizations
*/

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bookings_provider_status_date ON bookings(provider_id, status, requested_start);
CREATE INDEX IF NOT EXISTS idx_bookings_client_status_date ON bookings(client_id, status, requested_start);
CREATE INDEX IF NOT EXISTS idx_bookings_category_status ON bookings(category, status);
CREATE INDEX IF NOT EXISTS idx_bookings_date_range ON bookings(requested_start, requested_end);

-- Partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_services_active_provider ON services(provider_id) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_users_verified_providers ON users(city, created_at) 
  WHERE role = 'provider' AND (verification_status->>'verified')::boolean = true;

-- GIN indexes for JSONB search
CREATE INDEX IF NOT EXISTS idx_users_verification_gin ON users USING GIN(verification_status);
CREATE INDEX IF NOT EXISTS idx_services_extras_gin ON services USING GIN(extras);
CREATE INDEX IF NOT EXISTS idx_notifications_data_gin ON notifications USING GIN(data);

-- Text search indexes
CREATE INDEX IF NOT EXISTS idx_users_name_search ON users USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_providers_bio_search ON providers USING GIN(to_tsvector('english', bio));
CREATE INDEX IF NOT EXISTS idx_services_title_search ON services USING GIN(to_tsvector('english', title));

-- Function for provider search with filters
CREATE OR REPLACE FUNCTION search_providers(
  search_query text DEFAULT '',
  filter_category text DEFAULT '',
  filter_city text DEFAULT '',
  min_rating numeric DEFAULT 0,
  max_price numeric DEFAULT NULL,
  limit_count int DEFAULT 20,
  offset_count int DEFAULT 0
)
RETURNS TABLE (
  user_id uuid,
  name text,
  city text,
  category text,
  bio text,
  rating numeric,
  base_price numeric,
  verification_status jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.city,
    p.category,
    p.bio,
    p.rating,
    u.profile_base_price,
    u.verification_status
  FROM users u
  JOIN providers p ON u.id = p.user_id
  WHERE u.role = 'provider'
    AND (u.verification_status->>'verified')::boolean = true
    AND (search_query = '' OR 
         u.name ILIKE '%' || search_query || '%' OR
         p.bio ILIKE '%' || search_query || '%')
    AND (filter_category = '' OR p.category = filter_category)
    AND (filter_city = '' OR u.city ILIKE '%' || filter_city || '%')
    AND p.rating >= min_rating
    AND (max_price IS NULL OR u.profile_base_price <= max_price)
  ORDER BY p.rating DESC, u.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get provider availability
CREATE OR REPLACE FUNCTION get_provider_availability(
  provider_user_id uuid,
  check_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  day_of_week int,
  start_time time,
  end_time time,
  is_available boolean,
  has_booking boolean
) AS $$
BEGIN
  RETURN QUERY
  WITH provider_info AS (
    SELECT p.id as provider_id
    FROM providers p
    WHERE p.user_id = provider_user_id
  ),
  availability AS (
    SELECT 
      pa.day_of_week,
      pa.start_time,
      pa.end_time,
      pa.is_available
    FROM provider_availability pa
    JOIN provider_info pi ON pa.provider_id = pi.provider_id
    WHERE EXTRACT(DOW FROM check_date) = pa.day_of_week
  ),
  bookings AS (
    SELECT 
      EXTRACT(DOW FROM b.requested_start)::int as booking_dow,
      b.requested_start::time as booking_start,
      b.requested_end::time as booking_end
    FROM bookings b
    WHERE b.provider_id = provider_user_id
      AND DATE(b.requested_start) = check_date
      AND b.status IN ('ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_SERVICE')
  )
  SELECT 
    a.day_of_week,
    a.start_time,
    a.end_time,
    a.is_available,
    EXISTS(
      SELECT 1 FROM bookings b 
      WHERE b.booking_dow = a.day_of_week
        AND (b.booking_start, b.booking_end) OVERLAPS (a.start_time, a.end_time)
    ) as has_booking
  FROM availability a;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate booking statistics
CREATE OR REPLACE FUNCTION get_booking_stats(
  user_id uuid,
  start_date date DEFAULT CURRENT_DATE - interval '30 days',
  end_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_bookings bigint,
  completed_bookings bigint,
  cancelled_bookings bigint,
  total_earnings numeric,
  average_rating numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_bookings,
    COUNT(*) FILTER (WHERE b.status = 'COMPLETED') as completed_bookings,
    COUNT(*) FILTER (WHERE b.status = 'CANCELLED') as cancelled_bookings,
    COALESCE(SUM(b.provider_payout) FILTER (WHERE b.status = 'COMPLETED'), 0) as total_earnings,
    COALESCE(AVG(r.rating), 0) as average_rating
  FROM bookings b
  LEFT JOIN reviews r ON b.id = r.booking_id
  WHERE (b.provider_id = user_id OR b.client_id = user_id)
    AND DATE(b.created_at) BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for provider rankings
CREATE MATERIALIZED VIEW IF NOT EXISTS provider_rankings AS
SELECT 
  u.id,
  u.name,
  u.city,
  p.category,
  p.rating,
  COUNT(b.id) as total_bookings,
  COUNT(b.id) FILTER (WHERE b.status = 'COMPLETED') as completed_bookings,
  COALESCE(AVG(r.rating), 0) as review_rating,
  u.profile_base_price,
  ROW_NUMBER() OVER (PARTITION BY p.category ORDER BY p.rating DESC, COUNT(b.id) DESC) as category_rank
FROM users u
JOIN providers p ON u.id = p.user_id
LEFT JOIN bookings b ON u.id = b.provider_id
LEFT JOIN reviews r ON b.id = r.booking_id
WHERE u.role = 'provider' 
  AND (u.verification_status->>'verified')::boolean = true
GROUP BY u.id, u.name, u.city, p.category, p.rating, u.profile_base_price;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_rankings_id ON provider_rankings(id);

-- Function to refresh provider rankings
CREATE OR REPLACE FUNCTION refresh_provider_rankings()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY provider_rankings;
END;
$$ LANGUAGE plpgsql;

-- Add constraints for data integrity
ALTER TABLE bookings ADD CONSTRAINT booking_amount_consistency 
  CHECK (estimated_amount = platform_fee + provider_payout);

ALTER TABLE wallet_transactions ADD CONSTRAINT transaction_amount_not_zero 
  CHECK (amount != 0);

-- Function to validate wallet balance
CREATE OR REPLACE FUNCTION validate_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.balance < 0 THEN
    RAISE EXCEPTION 'Wallet balance cannot be negative';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_wallet_balance_trigger
  BEFORE UPDATE OF balance ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION validate_wallet_balance();