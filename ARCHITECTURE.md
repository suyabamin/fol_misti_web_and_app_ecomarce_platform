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
Customer Browser             Admin Browser              Delivery Rider Browser
 React Storefront             React Admin UI              React Rider Portal
        |                           |                            |
        +---------------------------+----------------------------+
                                    |
                       Firebase Auth / Firebase SDK
                                    |
        +---------------------------+----------------------------+
        |                                                        |
   Firestore reads                                         Cloud Functions
allowed by Security Rules                             trusted writes & workflows
(products, orders, locations)                       (orders, dispatch, payments)
        |                                                        |
        +---------------------------+----------------------------+
                                    |
                    Cloud Firestore (Multi-Collection)
                                    |
            +-----------------------+-----------------------+
            |                                               |
     Cloudinary Images                          OpenStreetMap Tiles (Leaflet)
 (optimized fruit/sweets)                           (free live GPS maps)

Future Flutter app:
 Flutter + Dart -> same Firebase project, schemas, Cloud Functions,
 Security Rules, authentication, Cloudinary URLs, and Leaflet/OSM endpoints.
```

## 3. Frontend Architecture
Web directories (`web/src/`):
- `components/`: reusable presentational components (buttons, badges, inputs, `LiveOrderTrackingMap`, chat widget)
- `layouts/`: customer (`CustomerLayout`), admin (`AdminLayout`), and delivery rider (`DeliveryLayout`)
- `pages/`: route-level pages (customer storefront, admin dashboard, delivery portal)
- `context/`: `AuthContext`, `CartContext`, `ThemeContext`
- `repositories/`: data-access layer (`orderRepository`, `productRepository`, `deliveryRepository`, `reviewRepository`, `chatRepository`)
- `models/`: central TypeScript types and status definitions
- `styles/`: design tokens, theme variables, and component CSS (Plain CSS3 only)
- `utils/`: currency formatters, date formatters, validation utilities

Do not place Firestore queries directly throughout unrelated UI components. Use repositories/services with typed interfaces.

## 4. Backend Architecture
Use Firebase Cloud Functions with TypeScript and a supported Node.js runtime. Organized by domain:
- `orders/`: atomic checkout, order creation, cancellations
- `products/`: product and inventory management
- `coupons/`: server-side coupon validation
- `reviews/`: customer review validation and moderation
- `admin/`: system settings, seasonal theme publishing, admin role management
- `delivery/`:
  - `manageDelivery.ts`: delivery rider role assignment, dispatch order assignment with schedule conflict checks
  - `tracking.ts`: start delivery, live GPS location updates, order handover marking
  - `receiptAndArchive.ts`: customer receipt confirmation, permanent order archiving, delivery issue reporting
  - `payments.ts`: admin rider payout recording with payable balance validation

Functions validate authentication, authorization, request schema, and business rules.

## 5. Direct Reads vs Backend Functions
Direct Firestore reads may be used for data that is safe to expose and covered by strict Security Rules, such as published products and public categories.

Use trusted backend functions for:
- Order creation and inventory decrements
- Price/discount/delivery calculation
- Coupon validation and redemption
- Admin operations and role escalation (`setAdminRole`, `setDeliveryRole`)
- Delivery assignment and reassignment
- GPS tracking session lifecycle (`startDelivery`, `updateLocation`, `markHandedOver`)
- Customer receipt confirmation and permanent archiving
- Delivery earnings generation and payout recording
- Payment confirmation and status updates

Do not expose unrestricted writes to orders, stock, prices, roles, or settings.

## 6. Delivery Management & Tracking Subsystem
1. **Rider Access & Security:**
   - Only admins can grant delivery roles (`delivery` claim in Firebase Auth).
   - Riders access a specialized portal (`/delivery/*`) to manage availability, weekly schedule, view active deliveries, and inspect their earnings ledger.
2. **Interactive Live Map (Leaflet + OpenStreetMap):**
   - Free-to-start mapping stack using Leaflet and standard OpenStreetMap tiles (`{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`) with proper OpenStreetMap contributors attribution.
   - Live marker updates without page refresh.
   - Stale GPS alert when coordinates are older than 5 minutes.
   - Privacy protection: Rider ID is never exposed in customer URLs; GPS data in `/deliveryLocations/{orderId}` is strictly accessible only to the customer owning the order, the assigned rider, and admins.
3. **Handover vs. Receipt Confirmation Separation:**
   - When a rider delivers an order, they mark it as "Handed Over" (`handed_over`).
   - This does **NOT** count as customer confirmation.
   - Customer must independently click "Yes, I Received My Order" (`confirmCustomerReceipt`), which transitions status to `receipt_confirmed`, marks COD payment as `paid`, snapshots the order to `/orderArchives/{orderId}`, creates the idempotent rider earnings entry, and unlocks rating eligibility.
   - If there is a problem, customer clicks "Report a Problem" (`reportDeliveryIssue`), filing a ticket in `/deliveryIssues`.
4. **Earnings & Payment Ledger:**
   - Each confirmed delivery generates an immutable entry in `/deliveryEarnings` (base fee + bonus + tip - commission).
   - Admins record payouts in `/deliveryPayments` (Cash, bKash, Nagad, Bank Transfer), strictly capped to rider's current payable balance.

## 7. Firestore Collections
- `users/{uid}`: Profile, addresses, role.
- `products/{productId}`: Name, Bengali name, prices, stock, image URLs, rating summary.
- `categories/{categoryId}`: Name, slug, images, sort order.
- `orders/{orderId}`: Order number, customer UID, item snapshots, delivery fee, status, history.
- `reviews/{reviewId}`: Product ratings, comments, moderation status.
- `coupons/{couponId}`: Code, discounts, limits, active dates.
- `banners/{bannerId}`: Storefront promotion banners.
- `settings/{documentId}`: Store settings and appearance theme configuration.
- `supportConversations/{conversationId}`: Real-time customer support conversations & subcollection `messages`.
- `deliveryProfiles/{deliveryPersonId}`: Rider phone, vehicle specs, working availability, and weekly shifts.
- `deliveryAssignments/{orderId}`: Active order-rider link, assignment history, notes.
- `deliveryLocations/{orderId}`: Ephemeral live GPS coordinates (`lat`, `lng`, `heading`, `speed`, `accuracy`).
- `orderArchives/{orderId}`: Permanent immutable order snapshots preserved upon customer receipt confirmation.
- `deliveryEarnings/{orderId}`: Payout entitlement generated per confirmed delivery.
- `deliveryPayments/{paymentId}`: Admin payout disbursement records.
- `deliveryIssues/{issueId}`: Customer delivery dispute tickets.

## 8. Money, Stock, and Orders
- Currency: Bangladeshi Taka (৳ / BDT).
- Stored as integers; no floating-point currency representation.
- Untrusted client inputs rejected; server computes subtotals, discounts, delivery fees, and grand totals.
- Atomic stock decrements and restoration on cancellation.
- Duplicate order protection via idempotency keys.

## 9. Authentication and Authorization
- Firebase Authentication for identity.
- Least-privilege Firestore Security Rules for data isolation.
- Admin and Delivery roles backed by custom claims and secure Firestore profile checks.
- Customer order and tracking data isolated to owning user.

## 10. Future Flutter Integration
The future app must reuse:
- Same Firebase project
- Same Authentication users
- Same Firestore collections and schemas
- Same Cloud Functions/API contracts
- Same order statuses and business rules
- Same Cloudinary URLs
- Same Leaflet/OSM map coordinate contracts

Documented in `docs/flutter-integration-guide.md`.
