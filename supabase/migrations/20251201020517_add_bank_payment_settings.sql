/*
  # Add Bank Payment Settings to Providers

  1. New Columns
    - `bank_name` (text) - Name of the provider's bank
    - `account_number` (text) - Provider's bank account number
    - `account_name` (text) - Account holder name (from bank verification)
    - `paystack_subaccount_code` (text) - Paystack subaccount code for split payments
    - `bank_verified` (boolean) - Whether bank details have been verified
    - `bank_verified_at` (timestamptz) - When bank was verified

  2. Security
    - RLS policies already exist for providers table
    - Sensitive bank information is protected by existing policies

  3. Important Notes
    - Bank details are encrypted in transit and at rest
    - Paystack subaccount code is auto-generated via API
    - Only verified bank accounts can receive payouts
*/

-- Add bank payment columns to providers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'providers' AND column_name = 'bank_name'
  ) THEN
    ALTER TABLE providers ADD COLUMN bank_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'providers' AND column_name = 'account_number'
  ) THEN
    ALTER TABLE providers ADD COLUMN account_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'providers' AND column_name = 'account_name'
  ) THEN
    ALTER TABLE providers ADD COLUMN account_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'providers' AND column_name = 'paystack_subaccount_code'
  ) THEN
    ALTER TABLE providers ADD COLUMN paystack_subaccount_code text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'providers' AND column_name = 'bank_verified'
  ) THEN
    ALTER TABLE providers ADD COLUMN bank_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'providers' AND column_name = 'bank_verified_at'
  ) THEN
    ALTER TABLE providers ADD COLUMN bank_verified_at timestamptz;
  END IF;
END $$;