/*
  # Create Booking Management Triggers and Functions

  1. Functions
    - Auto-expire booking requests after 24 hours
    - Handle booking status transitions
    - Manage wallet transactions for bookings
    - Prevent double booking conflicts

  2. Triggers
    - Auto-update booking status based on time
    - Create wallet transactions on booking events
    - Validate booking time conflicts

  3. Scheduled Functions
    - Cleanup expired booking requests
    - Auto-complete bookings after service time
*/

-- Function to handle booking status transitions
CREATE OR REPLACE FUNCTION handle_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- When booking is accepted, create escrow transaction
  IF OLD.status = 'REQUESTED' AND NEW.status = 'ACCEPTED' THEN
    -- Debit client wallet
    INSERT INTO wallet_transactions (wallet_id, booking_id, amount, type, meta)
    SELECT w.id, NEW.id, -NEW.estimated_amount, 'debit', 
           jsonb_build_object('description', 'Booking payment - held in escrow')
    FROM wallets w
    WHERE w.user_id = NEW.client_id;
    
    -- Update wallet balance
    UPDATE wallets 
    SET balance = balance - NEW.estimated_amount
    WHERE user_id = NEW.client_id;
  END IF;
  
  -- When booking is completed, process payments
  IF OLD.status != 'COMPLETED' AND NEW.status = 'COMPLETED' THEN
    -- Credit provider wallet (minus platform fee)
    INSERT INTO wallet_transactions (wallet_id, booking_id, amount, type, meta)
    SELECT w.id, NEW.id, NEW.provider_payout, 'credit', 
           jsonb_build_object('description', 'Booking payment received')
    FROM wallets w
    WHERE w.user_id = NEW.provider_id;
    
    -- Update provider wallet balance
    UPDATE wallets 
    SET balance = balance + NEW.provider_payout
    WHERE user_id = NEW.provider_id;
  END IF;
  
  -- When booking is cancelled, refund client
  IF OLD.status IN ('REQUESTED', 'ACCEPTED') AND NEW.status = 'CANCELLED' THEN
    -- Credit client wallet (full refund)
    INSERT INTO wallet_transactions (wallet_id, booking_id, amount, type, meta)
    SELECT w.id, NEW.id, NEW.estimated_amount, 'refund', 
           jsonb_build_object('description', 'Booking cancellation refund')
    FROM wallets w
    WHERE w.user_id = NEW.client_id;
    
    -- Update client wallet balance
    UPDATE wallets 
    SET balance = balance + NEW.estimated_amount
    WHERE user_id = NEW.client_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_status_change_trigger
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_booking_status_change();

-- Function to prevent double booking
CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for overlapping bookings for the same provider
  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE provider_id = NEW.provider_id
    AND status IN ('ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_SERVICE')
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND (
      (NEW.requested_start, NEW.requested_end) OVERLAPS 
      (requested_start, requested_end)
    )
  ) THEN
    RAISE EXCEPTION 'Provider is not available during the requested time slot';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_double_booking_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION prevent_double_booking();

-- Function to auto-expire booking requests
CREATE OR REPLACE FUNCTION expire_old_booking_requests()
RETURNS void AS $$
BEGIN
  -- Cancel booking requests older than 24 hours
  UPDATE bookings 
  SET status = 'CANCELLED'
  WHERE status = 'REQUESTED' 
  AND created_at < now() - interval '24 hours';
  
  -- Auto-complete bookings that have passed their end time
  UPDATE bookings 
  SET status = 'COMPLETED',
      actual_end = COALESCE(actual_end, requested_end),
      final_amount = COALESCE(final_amount, estimated_amount)
  WHERE status = 'IN_SERVICE' 
  AND requested_end < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Function to validate booking times
CREATE OR REPLACE FUNCTION validate_booking_times()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure booking is not in the past
  IF NEW.requested_start < now() THEN
    RAISE EXCEPTION 'Booking cannot be scheduled in the past';
  END IF;
  
  -- Ensure booking is not too far in the future (e.g., 3 months)
  IF NEW.requested_start > now() + interval '3 months' THEN
    RAISE EXCEPTION 'Booking cannot be scheduled more than 3 months in advance';
  END IF;
  
  -- Ensure minimum booking duration (e.g., 1 hour)
  IF NEW.requested_end - NEW.requested_start < interval '1 hour' THEN
    RAISE EXCEPTION 'Minimum booking duration is 1 hour';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_booking_times_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION validate_booking_times();

-- Function to update booking amounts
CREATE OR REPLACE FUNCTION calculate_booking_amounts()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate platform fee (5% of estimated amount)
  NEW.platform_fee = ROUND(NEW.estimated_amount * 0.05, 2);
  
  -- Calculate provider payout (estimated amount minus platform fee)
  NEW.provider_payout = NEW.estimated_amount - NEW.platform_fee;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_booking_amounts_trigger
  BEFORE INSERT OR UPDATE OF estimated_amount ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION calculate_booking_amounts();