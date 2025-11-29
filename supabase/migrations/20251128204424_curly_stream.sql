/*
  # Create Wallets and Wallet Transactions Tables

  1. New Tables
    - `wallets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users, unique)
      - `balance` (numeric, current balance)
      - `updated_at` (timestamptz)
    
    - `wallet_transactions`
      - `id` (uuid, primary key)
      - `wallet_id` (uuid, foreign key to wallets)
      - `booking_id` (uuid, foreign key to bookings, nullable)
      - `amount` (numeric, transaction amount)
      - `type` (text, transaction type)
      - `meta` (jsonb, additional metadata)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own wallet
    - Add policies for admins to manage all wallets

  3. Triggers
    - Auto-update wallet updated_at timestamp
    - Auto-create wallet for new users

  4. Indexes
    - Index on user_id for wallet lookups
    - Index on wallet_id for transaction queries
    - Index on booking_id for booking-related transactions
    - Index on transaction type and created_at
*/

CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  balance numeric(12,2) DEFAULT 0 CHECK (balance >= 0),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES wallets(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('credit', 'debit', 'refund', 'payout', 'topup', 'fee')),
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Wallet policies
CREATE POLICY "Users can view own wallet"
  ON wallets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own wallet"
  ON wallets
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

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

-- Wallet transaction policies
CREATE POLICY "Users can view own wallet transactions"
  ON wallet_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM wallets 
      WHERE id = wallet_transactions.wallet_id AND user_id = auth.uid()
    )
  );

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

CREATE POLICY "Admins can manage all wallet transactions"
  ON wallet_transactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_booking_id ON wallet_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);

-- Trigger to update wallet updated_at
CREATE OR REPLACE FUNCTION update_wallet_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_timestamp();

-- Function to create wallet for new users
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id, balance)
  VALUES (NEW.id, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_wallet_for_new_user
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_wallet();