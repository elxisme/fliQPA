/*
  # Create Reviews and Ratings Table

  1. New Tables
    - `reviews`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, foreign key to bookings, unique)
      - `reviewer_id` (uuid, foreign key to users)
      - `reviewee_id` (uuid, foreign key to users)
      - `rating` (integer, 1-5 stars)
      - `comment` (text, review comment)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `reviews` table
    - Add policy for users to view reviews about them
    - Add policy for users to create reviews for completed bookings
    - Add policy for public to view provider reviews

  3. Triggers
    - Auto-update provider rating when new review is added
    - Prevent duplicate reviews for same booking

  4. Indexes
    - Index on booking_id for review lookups
    - Index on reviewee_id for provider rating queries
    - Index on rating for filtering
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
  reviewer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id uuid REFERENCES users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT no_self_review CHECK (reviewer_id != reviewee_id)
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public can view provider reviews
CREATE POLICY "Public can view provider reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = reviews.reviewee_id AND role = 'provider'
    )
  );

-- Users can view reviews about them
CREATE POLICY "Users can view reviews about them"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (reviewee_id = auth.uid() OR reviewer_id = auth.uid());

-- Users can create reviews for completed bookings
CREATE POLICY "Users can create reviews for completed bookings"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = reviews.booking_id 
      AND b.status = 'COMPLETED'
      AND (b.client_id = auth.uid() OR b.provider_id = auth.uid())
      AND b.actual_end < now() - interval '1 hour' -- Allow 1 hour buffer
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Function to update provider rating
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update provider rating when new review is added
  IF TG_OP = 'INSERT' THEN
    UPDATE providers 
    SET rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM reviews 
      WHERE reviewee_id = NEW.reviewee_id
    )
    WHERE user_id = NEW.reviewee_id;
    RETURN NEW;
  END IF;
  
  -- Update provider rating when review is updated
  IF TG_OP = 'UPDATE' THEN
    UPDATE providers 
    SET rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM reviews 
      WHERE reviewee_id = NEW.reviewee_id
    )
    WHERE user_id = NEW.reviewee_id;
    RETURN NEW;
  END IF;
  
  -- Update provider rating when review is deleted
  IF TG_OP = 'DELETE' THEN
    UPDATE providers 
    SET rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM reviews 
      WHERE reviewee_id = OLD.reviewee_id
    ), 0)
    WHERE user_id = OLD.reviewee_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_provider_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_rating();