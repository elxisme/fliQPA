# Paystack Integration Setup

## Required Environment Variables

To use the Bank & Payment Settings feature, you need to configure the following Paystack secret in your Supabase project:

### Supabase Edge Function Secret

The following secret is required for the Edge Functions to communicate with Paystack API:

```
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
```

## How to Get Your Paystack Secret Key

1. **Sign up for Paystack** (if you haven't already)
   - Go to https://paystack.com
   - Create an account (free for testing)

2. **Get Your Secret Key**
   - Log in to your Paystack Dashboard
   - Navigate to Settings > API Keys & Webhooks
   - Copy your **Secret Key** (starts with `sk_test_` for test mode or `sk_live_` for live mode)

3. **Configure in Supabase**
   - The secret is automatically configured in your Supabase environment
   - For testing, use the test mode key (`sk_test_...`)
   - For production, use the live mode key (`sk_live_...`)

## Features Enabled

Once configured, providers can:

1. **View Nigerian Banks** - Fetch list of all Nigerian banks via Paystack
2. **Verify Bank Account** - Verify account number and retrieve account holder name
3. **Create Subaccount** - Automatically create Paystack subaccount for split payments
4. **Receive Payouts** - Get 80% of each completed booking automatically

## Payment Flow

1. Provider adds bank details in Settings > Bank & Payment Settings
2. System verifies account via Paystack API
3. Paystack subaccount is created with 80/20 split configuration
4. When clients pay for bookings, funds are automatically split:
   - **80%** goes to provider's bank account
   - **20%** stays with platform

## Important Notes

- Bank details are locked once verified
- All transactions are secured by Paystack
- Payouts are processed within 24 hours of booking completion
- Only Nigerian bank accounts are currently supported

## Testing

For testing, use Paystack test mode:
- Test Secret Key: `sk_test_xxxxxxxxxxxxxxxxxxxxx`
- Use test bank account numbers from Paystack documentation
- No real money is transferred in test mode

## Support

For Paystack-related issues:
- Documentation: https://paystack.com/docs
- Support: support@paystack.com
