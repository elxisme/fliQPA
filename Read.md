
## Project Name: fliQ – On‑Demand Service Marketplace (Client ↔ Provider)

fliQ is a modern on‑demand, location‑aware service marketplace built with **React**, **Supabase**, and **Paystack split payments**, enabling clients to book service providers such as companions, bouncers, bodyguards, and assistants.

The platform includes:
- Full authentication (Supabase Auth)
- Role‑based onboarding (Client / Provider)
- Provider service category selection
- Booking, payment, acceptance flow
- Provider settlement using Paystack Split or Transfers
- Disputes, auto‑completion, and escrow logic
- Wallet refunds for failed/declined bookings
- RLS‑secured database models

---

## Tech Stack
### **Frontend**
- React + TypeScript
- TailwindCSS
- React Router
- Zustand or Context API for state
- Framer Motion

### **Backend / Database**
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Edge Functions (Serverless API)

### **Payments**
- Paystack Standard Checkout (initial)
- Paystack Split Payments OR Transfer API (for provider payouts)

---

## High‑Level Features
- User authentication + role-based registration
- Provider onboarding (category, services, pricing)
- Client searches and views providers nearby
- Booking and secure payment flow
- Provider accepts/declines
- Refunds to client wallet on decline
- Escrow release after service completion
- Auto-complete after 24 hours
- Dispute system
- Provider payout automation

---

## Installation
```
npm install
npm run dev
```

Set up environment variables (`.env`):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_PAYSTACK_PUBLIC_KEY=
```

---

## Database Structure
### **users**
Holds all authenticated users.
- id (uuid)
- name
- email
- phone
- city
- role

### **profiles**
Linked 1-to-1 with users.
- user_id
- category
- base_price
- avatar
- verification

### **providers** (optional)
Stores provider-specific professional data.

### **bookings**
Stores all booking lifecycle data.

### **wallets**
Stores client wallet balances and transactions.

---

## Running Migrations
```
supabase migration up
```

If dropping the entire database:
```
drop schema public cascade;
create schema public;
```

---

## Contact & Contribution
Pull requests welcome. For collaboration, contact project owner.

---
