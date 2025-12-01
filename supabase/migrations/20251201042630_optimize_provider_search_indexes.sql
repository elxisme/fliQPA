/*
  # Optimize Provider Search and Discovery

  ## Purpose
  Enhance search performance for the Provider Discovery workflow by adding
  specialized indexes for common filter combinations and search patterns.

  ## Changes

  ### 1. New Indexes
  - Composite index on (role, verification_status, city) for location-filtered verified provider searches
  - GIN index on services.price_hour, price_day, price_week for price range queries
  - Composite index on providers (category, rating) for category + rating filters
  - Index on users.profile_base_price for price-based sorting

  ### 2. Performance Optimizations
  - These indexes support the client dashboard's filtering workflow:
    * Fast lookup of verified providers in specific cities
    * Efficient price range filtering
    * Quick category + rating combinations
    * Improved sorting by price

  ## Security
  - No RLS changes (existing policies remain in effect)
  - Indexes do not affect data access, only query performance

  ## Important Notes
  - These indexes optimize queries that filter by:
    * Verification status (verified providers only)
    * Location (city-based searches)
    * Price ranges (min/max filters)
    * Category + rating combinations
  - Monitor index usage and adjust if query patterns change
*/

-- ============================================================================
-- USERS TABLE - Additional Search Optimization
-- ============================================================================

-- Composite index for verified providers by city
-- Supports: WHERE role = 'provider' AND verified = true AND city = ?
CREATE INDEX IF NOT EXISTS idx_users_verified_providers_by_city 
  ON users(role, city) 
  WHERE (verification_status->>'verified')::boolean = true;

-- Index on base price for price filtering and sorting
CREATE INDEX IF NOT EXISTS idx_users_profile_base_price 
  ON users(profile_base_price) 
  WHERE role = 'provider' AND profile_base_price IS NOT NULL;

-- Partial index specifically for verified providers with prices
CREATE INDEX IF NOT EXISTS idx_users_verified_with_price 
  ON users(role, city, profile_base_price) 
  WHERE (verification_status->>'verified')::boolean = true 
    AND profile_base_price IS NOT NULL;

-- ============================================================================
-- PROVIDERS TABLE - Category and Rating Optimization
-- ============================================================================

-- Composite index for category + rating filters
-- Supports: WHERE category = ? AND rating >= ?
CREATE INDEX IF NOT EXISTS idx_providers_category_rating 
  ON providers(category, rating) 
  WHERE rating > 0;

-- Index on rating for sorting
CREATE INDEX IF NOT EXISTS idx_providers_rating 
  ON providers(rating DESC) 
  WHERE rating > 0;

-- ============================================================================
-- SERVICES TABLE - Price Range Optimization
-- ============================================================================

-- Index on hourly prices for range queries
CREATE INDEX IF NOT EXISTS idx_services_price_hour 
  ON services(price_hour) 
  WHERE price_hour IS NOT NULL AND active = true;

-- Index on daily prices for range queries
CREATE INDEX IF NOT EXISTS idx_services_price_day 
  ON services(price_day) 
  WHERE price_day IS NOT NULL AND active = true;

-- Index on weekly prices for range queries
CREATE INDEX IF NOT EXISTS idx_services_price_week 
  ON services(price_week) 
  WHERE price_week IS NOT NULL AND active = true;

-- Composite index for provider's active services
CREATE INDEX IF NOT EXISTS idx_services_provider_active 
  ON services(provider_id, active) 
  WHERE active = true;

-- ============================================================================
-- QUERY OPTIMIZATION NOTES
-- ============================================================================

/*
  These indexes are optimized for the following common query patterns:

  1. VERIFIED PROVIDERS BY CITY:
     SELECT * FROM users 
     WHERE role = 'provider' 
       AND (verification_status->>'verified')::boolean = true 
       AND city = 'Lagos'
     Uses: idx_users_verified_providers_by_city

  2. PRICE RANGE FILTERING:
     SELECT * FROM users u
     JOIN services s ON s.provider_id = u.providers.id
     WHERE u.role = 'provider'
       AND s.price_hour BETWEEN 5000 AND 15000
       AND s.active = true
     Uses: idx_services_price_hour, idx_services_provider_active

  3. CATEGORY + RATING:
     SELECT * FROM providers
     WHERE category = 'companion'
       AND rating >= 4.0
     Uses: idx_providers_category_rating

  4. COMBINED FILTERS:
     The partial indexes work together to support complex queries
     combining location, price, and verification status.
*/
