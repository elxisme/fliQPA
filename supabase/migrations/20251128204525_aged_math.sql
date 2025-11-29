/*
  # Create Notification System

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `type` (text, notification type)
      - `title` (text, notification title)
      - `message` (text, notification message)
      - `data` (jsonb, additional data)
      - `read` (boolean, read status)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `notifications` table
    - Add policy for users to manage their own notifications

  3. Functions
    - Create notifications for booking events
    - Mark notifications as read
    - Clean up old notifications

  4. Triggers
    - Auto-create notifications on booking status changes
    - Auto-create notifications on new reviews
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'booking_request', 'booking_accepted', 'booking_cancelled', 
    'booking_started', 'booking_completed', 'payment_received',
    'review_received', 'dispute_created', 'dispute_resolved',
    'verification_approved', 'verification_rejected'
  )),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can manage their own notifications
CREATE POLICY "Users can manage own notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to handle booking notifications
CREATE OR REPLACE FUNCTION create_booking_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- New booking request
  IF TG_OP = 'INSERT' AND NEW.status = 'REQUESTED' THEN
    PERFORM create_notification(
      NEW.provider_id,
      'booking_request',
      'New Booking Request',
      'You have received a new booking request',
      jsonb_build_object('booking_id', NEW.id)
    );
  END IF;
  
  -- Booking status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    CASE NEW.status
      WHEN 'ACCEPTED' THEN
        PERFORM create_notification(
          NEW.client_id,
          'booking_accepted',
          'Booking Accepted',
          'Your booking request has been accepted',
          jsonb_build_object('booking_id', NEW.id)
        );
      
      WHEN 'CANCELLED' THEN
        -- Notify the other party
        IF OLD.status = 'REQUESTED' THEN
          PERFORM create_notification(
            NEW.client_id,
            'booking_cancelled',
            'Booking Cancelled',
            'Your booking request was cancelled',
            jsonb_build_object('booking_id', NEW.id)
          );
        ELSE
          PERFORM create_notification(
            CASE WHEN NEW.client_id = auth.uid() THEN NEW.provider_id ELSE NEW.client_id END,
            'booking_cancelled',
            'Booking Cancelled',
            'A booking has been cancelled',
            jsonb_build_object('booking_id', NEW.id)
          );
        END IF;
      
      WHEN 'IN_SERVICE' THEN
        PERFORM create_notification(
          NEW.client_id,
          'booking_started',
          'Service Started',
          'Your service has started',
          jsonb_build_object('booking_id', NEW.id)
        );
      
      WHEN 'COMPLETED' THEN
        PERFORM create_notification(
          NEW.client_id,
          'booking_completed',
          'Service Completed',
          'Your service has been completed',
          jsonb_build_object('booking_id', NEW.id)
        );
        
        PERFORM create_notification(
          NEW.provider_id,
          'payment_received',
          'Payment Received',
          'You have received payment for your service',
          jsonb_build_object('booking_id', NEW.id, 'amount', NEW.provider_payout)
        );
    END CASE;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_notifications_trigger
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_booking_notifications();

-- Function to handle review notifications
CREATE OR REPLACE FUNCTION create_review_notifications()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM create_notification(
      NEW.reviewee_id,
      'review_received',
      'New Review Received',
      'You have received a new review',
      jsonb_build_object('review_id', NEW.id, 'rating', NEW.rating)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_notifications_trigger
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION create_review_notifications();

-- Function to clean up old notifications (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications 
  WHERE created_at < now() - interval '30 days'
  AND read = true;
END;
$$ LANGUAGE plpgsql;