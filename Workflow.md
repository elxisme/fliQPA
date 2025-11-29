# TECHNICAL Workflow

# fliQ Technical Specification
A deep‑dive technical explanation for engineers working on the project.

---

# 1. System Overview
fliQ is a **2‑sided marketplace**:
- **Clients** browse, book, and pay for services
- **Providers** receive bookings, complete jobs, and get settlements

All payments move through the app (escrow model).

---

# 2. Authentication Workflow
### **Sign Up**
1. User submits email + password to Supabase Auth.
2. Supabase creates auth user.
3. A row is automatically inserted into `users` via an Edge Function or client insert.
4. If provider → redirect to onboarding.
5. If client → go to dashboard.

### **Login**
Standard Supabase Auth login.

---

# 3. User Roles
### **Client**
- Search/Discover providers
- Make bookings
- Pay through Paystack
- Approve completion / create dispute
- Receive refunds into wallet

### **Provider**
- Select primary category
- Set base hourly rate
- Receive bookings
- Accept/Decline
- Mark job complete
- Receive payout

---

# 4. Booking Workflow (Critical)
### **A. Client creates booking**
1. Chooses provider
2. Selects service duration
3. Pays via Paystack checkout
4. Booking moves to `pending_acceptance`

### **B. Provider Accepts / Declines**
- **Accept** → booking becomes `in_progress`
- **Decline** → automatic refund to client wallet

Refund Logic:
```
wallet.balance += booking.amount
wallet.transactions.insert({ type: 'refund', amount })
```

### **C. Service Completion**
Provider taps *Request Completion*.

Client:
- Confirms → funds released to provider
- Rejects → dispute created
- Ignores → auto-complete after 24 hours

### **D. Settlement**
Paystack Split (recommended):
- Provider receives **80%**
- App receives **20%**
Automatically occurs at checkout.

For Transfer API settlement:
- Funds remain in main app Paystack account
- After completion: server triggers transfer to the provider subaccount

---

# 5. Database Tables
### **users**
Stores account identity.

### **profiles**
Stores role‑specific extended information.

### **bookings**
Stores full job lifecycle.

### **wallets**
Escrow + refunds.

### **transactions**
Logs all wallet movements.

### **disputes**
Tracks conflict resolution cases.

---

# 6. RLS Rules (Principles)
### Users
- Each user can read/write only their own row
- Admins can read/write all

### Profiles
- Each profile belongs to exactly one user
- Providers can modify their own
- Clients can read provider profiles

### Bookings
- Client can only see their own
- Provider can only see bookings they are part of

---

# 7. Paystack Integration
### For Client Payments
Use Standard Checkout with metadata:
```
{ provider_id, client_id, booking_id }
```

### Split Payment Setup
Provider has a `paystack_subaccount_id`.

At payment time:
```
split: [
 { subaccount: provider_sub_id, share: 80 },
 { subaccount: platform_sub_id, share: 20 }
]
```

### Provider Payout (if not using split)
Use Transfers API after job completion.

---

# 8. Edge Functions
Recommended functions:
- `create-user-profile`
- `refund-booking`
- `settle-provider`
- `auto-complete-bookings`
- `create-dispute`

---

# 9. Frontend Architecture
```
/src
  /components
  /pages
  /contexts
  /hooks
  /lib (supabase, paystack)
  /types
```
State managed using Context + local reducers.

---

# 10. Developer Notes
- Follow PSR‑4 and modular structure
- Keep RLS enabled at all times
- Never expose service role key on frontend
- Use Edge Functions for all secure operations
- Use Paystack metadata for traceability
- Wallet must be **ledgered**, not overwritten

---

# End of Documentation
