# Fol Mishti Website — Architecture

## 1. Architecture Principles
- Build the website first; Flutter comes later.
- Maintain one Firebase project and one authoritative Firestore database for both future clients.
- Keep trusted business rules in Cloud Functions.
- Separate presentation, application state, data access, and backend logic.
- Use documented API contracts and central status/model definitions.
- Never trust the browser for final price, stock, role, discount, or payment state.

## 2. High-Level System
```text
Customer Browser                         Admin Browser
 React + Vite + TypeScript               React Admin UI
          |                                      |
          +------------------+-------------------+
                             |
              Firebase Auth / Firebase SDK
                             |
          +------------------+-------------------+
          |                                      |
     Firestore reads                     Cloud Functions
  allowed by Security Rules       trusted writes/business logic
          |                                      |
          +------------------+-------------------+
                             |
                      Cloud Firestore
                             |
                       Cloudinary images

Future Flutter app:
 Flutter + Dart -> same Firebase project, schemas, Cloud Functions,
 Security Rules, authentication, and Cloudinary URLs.
```

## 3. Frontend Architecture
Recommended web folders:
- `app/`: app bootstrap, routing, providers
- `components/`: reusable presentational components
- `layouts/`: customer and admin layouts
- `pages/`: route-level pages
- `features/`: feature-specific UI and state
- `services/`: Firebase initialization and external service wrappers
- `repositories/`: data-access functions
- `models/`: typed models and schema validation
- `hooks/`: reusable React hooks
- `styles/`: tokens, global styles, component styles
- `utils/`: pure utility functions

Do not place Firestore queries directly throughout unrelated UI components. Use repositories/services with typed interfaces.

## 4. Backend Architecture
Use Firebase Cloud Functions with TypeScript and a supported Node.js runtime. Organize by domain:
- `products/`
- `orders/`
- `coupons/`
- `reviews/`
- `admin/`
- `shared/`

Functions should validate authentication, authorization, request schema, and business rules. Use a consistent response/error contract. Use callable functions or HTTPS endpoints as appropriate and document the selected approach.

## 5. Direct Reads vs Backend Functions
Direct Firestore reads may be used for data that is safe to expose and covered by strict Security Rules, such as published products and public categories.

Use trusted backend functions for:
- Order creation
- Price/discount/delivery calculation
- Inventory changes
- Coupon redemption
- Admin operations
- Role changes
- Sensitive cancellation/refund logic
- Payment confirmation/webhooks if a gateway is added

Do not expose unrestricted writes to orders, stock, prices, roles, or settings.

## 6. Firestore Collections
### `users/{uid}`
Profile fields such as display name, email, phone, default address references, and timestamps. Role must come from trusted claims or a protected role record, not client-controlled fields.

### `products/{productId}`
Name, slug, description, category ID, unit, price representation, optional compare-at price, image URLs, stock, active/featured/seasonal flags, rating summary, timestamps.

### `categories/{categoryId}`
Name, slug, description, image URL, active flag, sort order, timestamps.

### `orders/{orderId}`
Owner UID, item snapshots, address/contact snapshot, subtotal, discount, delivery fee, total, currency, payment method/status, order status, status history, timestamps, idempotency metadata as appropriate.

### `reviews/{reviewId}`
Product ID, user UID, order reference if required, rating, text, moderation status, timestamps.

### `coupons/{couponId}`
Code normalization, active dates, usage constraints, discount rules, eligibility, limits. Enforce redemption server-side.

### `banners/{bannerId}`
Image URL, title, subtitle, destination, active window, sort order.

### `settings/{documentId}`
Public storefront settings separated from sensitive/admin-only settings.

### `wishlists/{uid}`
A protected per-user wishlist document or subcollection. Choose a schema appropriate to expected size and document it.

Use additional collections only when necessary, and document indexes and access rules.

## 7. Money, Stock, and Orders
- Use BDT as the storefront currency.
- Store money in integer minor units or another explicitly documented safe representation.
- Do not use floating-point math for financial totals.
- Treat all client-supplied prices and totals as untrusted.
- The backend fetches current prices and stock.
- Validate quantity limits.
- Use Firestore transactions or another correct atomic design for stock and order writes.
- Protect against duplicate order requests with an idempotency strategy.
- Define stock restoration on cancellation and ensure it cannot happen twice.
- Payment status must only be updated by trusted server-side verification.

## 8. Authentication and Authorization
- Firebase Authentication handles identity.
- Firestore Rules protect user-owned data.
- Admin authorization uses verified custom claims or a trusted server-managed role system.
- Never trust a client-side `isAdmin` flag.
- Avoid exposing sensitive user information in public product endpoints.
- Apply App Check where appropriate.

## 9. Cloudinary
Store only validated Cloudinary URLs and metadata in Firestore. Production uploads should use a trusted signed-upload flow or another secure, restricted approach. Never place the Cloudinary API secret in web code.

## 10. Configuration
Use `.env.example` with placeholders only. Keep secrets out of Git. Document required variables and platform configuration. Firebase client configuration is intended to be used by clients but must be protected by Authentication, Security Rules, and appropriate restrictions.

## 11. Testing and Observability
- Unit tests for validation and business logic
- Function tests for order and coupon operations
- Firestore Rules tests
- Frontend component/service tests for important flows
- Firebase Emulator Suite for local integration tests where practical
- Log useful server errors without logging passwords, tokens, or unnecessary personal data

## 12. Future Flutter Integration
The future app must reuse:
- Same Firebase project
- Same Authentication users
- Same Firestore collections and schemas
- Same Cloud Functions/API contracts
- Same order statuses and business rules
- Same Cloudinary URLs

Document SDK versions and setup steps in `docs/flutter-integration-guide.md`. Do not build the Flutter project during the website phase.
