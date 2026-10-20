# Product Requirements Document (PRD) — Fol Mishti Website

## 1. Product Overview
**Product name:** Fol Mishti (ফল মিষ্টি)

**Purpose:** Build a trustworthy, attractive ecommerce website in Bangladesh for seasonal fruits and Bengali sweets. Customers should be able to discover products, manage a cart, place Cash on Delivery (COD) orders, and track orders. Administrators should manage products, stock, customers, and orders.

## 2. Goals
- Provide a polished, responsive shopping experience.
- Support Bangla and English content where practical.
- Provide reliable product, inventory, and order data from Firebase.
- Securely support customer and administrator workflows.
- Establish a backend and documented contracts that a future Flutter app can reuse.
- Avoid unnecessary paid services, while clearly documenting services that require billing or paid plans.

## 3. Out of Scope for Website Phase
- Flutter/Android/iOS source code.
- A production online payment gateway in the initial release.
- Native mobile-only features.
- Any claim of production readiness before testing and deployment checks pass.

## 4. User Roles
### Guest
- Browse products/categories
- Search and filter products
- View product details
- Manage a local guest cart
- Register or sign in to place/track orders as required by business policy

### Customer
- Register/sign in with email/password
- Sign in with Google
- Reset password
- Manage profile and delivery addresses
- Add/remove products from cart
- Manage wishlist
- Place COD orders
- View order history and status
- Submit reviews only when eligible under configured rules

### Administrator
- Access a protected admin dashboard
- Create/update/archive products and categories
- Manage stock and availability
- View and update orders
- View customers and apply permitted account actions
- Moderate reviews
- Manage coupons, banners, and store settings
- View operational dashboard summaries
- Register and promote delivery personnel, configure shifts and workload limits
- Assign and reassign orders with conflict checks and audit logs
- Record delivery rider payouts against verified balances
- Investigate and resolve customer delivery dispute tickets

### Delivery Person
- Access a dedicated delivery rider portal (`/delivery/*`)
- Update working availability status (`available`, `in_order`, `on_break`, `unavailable`)
- Manage weekly work schedule, shifts, and leave status
- View assigned deliveries and phone customer directly via one-click call
- Start delivery and transmit live GPS coordinates to customer tracking map
- Mark order handed over with recipient name and handover notes
- View completed delivery history
- Inspect earnings ledger, base fees, bonuses, tips, and payout receipts
- Update vehicle profile (motorbike, bicycle, van, walking) and contact info

Admin privileges and Delivery Person roles must be enforced on the server, not merely by hiding frontend routes.

## 5. Customer Pages
- Home
- Shop
- Fruits
- Sweets
- Category listing
- Product details
- Search and filters
- Cart
- Checkout
- Order success/confirmation
- Order tracking
- Wishlist
- Login
- Registration
- Forgot password
- Account/profile
- Address management
- My orders
- Order details (with live map & handover confirmation)
- Permanent order archive (`/account/archive`)
- Reviews and ratings
- Offers and coupons
- About us
- Contact us
- FAQ
- Shipping policy
- Refund/cancellation policy
- Privacy policy
- Terms and conditions
- Custom 404 page

## 6. Admin Pages
- Admin login/guarded access
- Dashboard
- Product management
- Category management
- Order management & dispatch assignment
- Delivery personnel management (`/admin/delivery-people`)
- Delivery payments & payouts (`/admin/delivery-payments`)
- Delivery issues & dispute tickets (`/admin/delivery-issues`)
- Customer management
- Review moderation
- Coupon management
- Banner management
- Store settings & appearance themes

## 6.1 Delivery Rider Pages (`/delivery/*`)
- Rider dashboard & active deliveries (`/delivery`)
- Delivery history (`/delivery/history`)
- Earnings ledger & payout receipts (`/delivery/earnings`)
- Weekly schedule & shift management (`/delivery/schedule`)
- Rider profile & vehicle details (`/delivery/profile`)

## 7. Functional Requirements
### Product discovery
- Products load from the configured backend, not hardcoded production arrays.
- Support category navigation, search, sorting, and filters where data supports them.
- Show price, unit, availability, product images, and relevant details.
- Handle unavailable, deleted, and out-of-stock products gracefully.

### Cart
- Add/remove products and update quantity.
- Validate quantities and stock before checkout.
- Persist guest cart locally.
- On sign-in, merge guest cart into the account cart only according to a documented, conflict-safe policy.
- If cross-device cart is enabled, store it using an authenticated, protected strategy.

### Checkout and orders
- Collect customer contact and delivery address.
- Display an order summary, delivery fee, applicable coupon, and total.
- The backend must calculate the authoritative total from current product prices, stock, delivery rules, and coupon rules.
- Initial payment method: COD.
- Create the order and reserve/decrement stock atomically using a trusted backend operation.
- Use idempotency protection to avoid duplicate orders from repeated submissions.
- Show the canonical order ID and confirmation only after backend success.
- Track order status based on trusted stored data.
- Cancellation must follow documented business rules and stock-restoration policy.

### Delivery Management and Live Tracking
- Admin can assign available delivery riders to ready orders.
- Rider reassignment invalidates previous rider tracking sessions and records audit logs.
- Real-time GPS location updates from riders using browser Geolocation API into `/deliveryLocations/{orderId}`.
- Live customer order map using Leaflet and OpenStreetMap tiles displaying Store, Rider (with radar pulse), and Customer delivery pin.
- Stale location detection alert if rider GPS has not updated for >5 minutes.
- **Strict Handover vs. Confirmation Separation:** Rider marking "Handed Over" does not count as customer receipt. Order remains in `handed_over` status until customer independently confirms receipt ("Yes, I Received My Order") or disputes delivery ("Report a Problem").
- Customer receipt confirmation triggers:
  1. Permanent immutable snapshot in `/orderArchives/{orderId}`.
  2. Idempotent creation of rider earnings ledger entry in `/deliveryEarnings/{orderId}`.
  3. Post-confirmation 2-way rating eligibility (product rating + delivery rider rating).
- Admin payment recording (`/deliveryPayments`) allows recording payouts to riders, strictly capped to current payable balance.

### Authentication
- Email/password registration and login
- Google sign-in
- Logout
- Password reset
- Restore auth state on page refresh
- Friendly, non-sensitive error messages

### Reviews
- Validate rating range and content.
- Restrict review creation to eligible customers/orders according to documented policy.
- Allow admin moderation.
- Do not trust client-generated aggregate ratings.

### Admin
- Require verified admin authorization on protected operations.
- Validate all input server-side.
- Record timestamps and, for sensitive status changes, appropriate audit history.
- Use pagination for large collections.

## 8. Non-Functional Requirements
- Responsive on mobile, tablet, and desktop.
- Accessible keyboard navigation, labels, contrast, and focus states.
- Reasonable performance and image optimization.
- Clear error states and safe retry behavior.
- Maintainable TypeScript and reusable components.
- No secrets in client bundles or Git.
- Firestore Security Rules follow least privilege.
- Critical operations have tests.
- Documentation explains setup and deployment.

## 9. Data and Integration Requirements
Required initial Firestore collections:
- `users`
- `products`
- `categories`
- `orders`
- `reviews`
- `coupons`
- `banners`
- `settings`
- `wishlists`
- `deliveryProfiles`
- `deliveryAssignments`
- `deliveryLocations`
- `orderArchives`
- `deliveryEarnings`
- `deliveryPayments`
- `deliveryIssues`

Additional collections may be introduced when justified and documented.

Images are stored on Cloudinary; Firestore stores validated URLs and relevant metadata.

## 10. Acceptance Criteria
- All required pages exist and their primary navigation works.
- Product data is loaded from the configured backend.
- Authentication flows work with configured Firebase providers.
- Admin access is protected by server-verified roles.
- COD orders are created by trusted backend logic.
- Client-tampered totals, stock values, and roles are rejected.
- Customers cannot read another customer's private order data.
- Admin product/order changes are reflected in the customer interface.
- Empty/loading/error states are implemented.
- Build and tests run successfully, or remaining failures are clearly documented.
- `docs/flutter-integration-guide.md` describes reuse of the same backend for a future app.
- No Flutter source files are created in this phase.

## 11. Success Measures
- A user can browse, select, and order available products.
- An admin can manage products and orders.
- The backend prevents unauthorized access and invalid order totals.
- Core cross-platform contracts are documented for future Flutter development.
