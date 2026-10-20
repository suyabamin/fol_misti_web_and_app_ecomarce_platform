# Fol Mishti Website — Project Memory

This file contains stable project decisions. Read it before making architecture or implementation changes. Update it when the owner explicitly changes a decision.

## Product
- Project name: Fol Mishti
- Bengali name: ফল মিষ্টি
- Business: Ecommerce for seasonal fruits and Bengali sweets in Bangladesh
- Store currency: BDT (৳)
- Initial payment: Cash on Delivery (COD)

## Current Status & Priority
- **Website and Delivery System Status:** COMPLETE and FULLY FUNCTIONAL.
- 24 Customer Storefront pages, 16 Admin pages, 5 Delivery Rider pages (`/delivery/*`), Leaflet live GPS tracking, Customer Receipt Confirmation & Permanent Order Archive, Delivery Person Earnings Ledger, Admin Delivery Payments & Issues management are completely implemented and verified.
- Production build passes with 0 errors across both `web/` (`tsc -b && vite build`) and `functions/` (`tsc`).
- Do not create Flutter source files during this phase. All backend schemas and API contracts are documented for future Flutter mobile client reuse.

## Chosen Stack
- Web: React 19 + Vite + TypeScript
- Styling: Plain CSS3; strict ban on Tailwind CSS and Bootstrap
- Routing: React Router v7
- Database: Firebase Cloud Firestore
- Authentication: Firebase Authentication (Email/Password, Google sign-in, and custom claims for admin & delivery roles)
- Backend: Firebase Cloud Functions with TypeScript
- Images: Cloudinary (secure uploads, optimized CDN delivery)
- Maps & Live Tracking: Leaflet + OpenStreetMap tiles (`{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`) with proper attribution
- Initial payment: Cash on Delivery (COD)
- Future mobile app: Flutter for Android and iOS using the same Firebase project and API contracts

## Stable Delivery Decisions
1. **Separation of Handover vs. Customer Receipt:**
   - A delivery person marking an order as "Handed Over" does NOT complete the order or confirm customer receipt.
   - The customer must independently verify and confirm receipt ("Yes, I Received My Order").
   - Customer confirmation transitions status to `receipt_confirmed`, marks COD payment as `paid`, snapshots the order into `/orderArchives/{orderId}`, idempotently generates rider payout earnings in `/deliveryEarnings/{orderId}`, and unlocks two-stage rating eligibility.
2. **Delivery Role Security:**
   - Delivery roles can only be granted, updated, or revoked by an administrator via Cloud Function `setDeliveryRole`.
3. **Rider Privacy Protection:**
   - Delivery rider UIDs are never exposed in customer URLs or customer-facing search queries.
   - Real-time GPS coordinates in `/deliveryLocations/{orderId}` are strictly restricted by Firestore Security Rules to the customer owning that order, the assigned rider, and administrators.
4. **Earnings & Admin Payout Ledger:**
   - Rider earnings entries are generated exactly once upon verified customer receipt confirmation.
   - Admin payout disbursements recorded in `/deliveryPayments` are capped to the rider's outstanding payable balance.
5. **Permanent Order Archive:**
   - Customer receipt confirmation creates an immutable snapshot in `/orderArchives/{orderId}` preserving historical unit prices, discounts, delivery fees, items, and delivery audit timestamps.

## Security Decisions
- Client-supplied prices, totals, discounts, stock, and roles are untrusted.
- Server validates checkout and recalculates totals.
- Stock and order changes are atomic and protected against duplicate submissions via idempotency keys.
- Admin and Delivery permissions are enforced by trusted backend authorization and Firestore Security Rules.
- Never expose Cloudinary API secrets, service-account credentials, or private keys in client code.
- Least-privilege Firestore Security Rules applied across all collections.

## Pre-Configured Test Accounts (Demo Mode)
- **Admin:** `admin@folmishti.com` (Password: `Password123!`) -> Admin Dashboard (`/admin`)
- **Delivery Rider:** `delivery@folmishti.com` (Password: `Password123!`) -> Delivery Portal (`/delivery`)
- **Customer:** `customer@folmishti.com` (Password: `Password123!`) -> Storefront / Account (`/account`, `/account/archive`)
