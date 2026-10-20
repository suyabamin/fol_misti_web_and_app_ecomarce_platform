# Fol Mishti Website — Development Tasks

Use this file as the implementation checklist. Mark tasks complete only after the relevant work exists and has been checked. Keep `progress.md` aligned with this file.

## Phase 0 — Workspace and Planning
- [x] Inspect current workspace and preserve existing user work.
- [x] Confirm repository root and package manager.
- [x] Read all project documentation.
- [x] Create `progress.md`.
- [x] Define architecture, Firestore schema, API contracts, status enums, and design tokens.
- [x] Record all required Firebase/Cloudinary/Vercel configuration.

## Phase 1 — Project Foundation
- [x] Create React + Vite + TypeScript app under `web/`.
- [x] Configure linting, formatting, and type-check scripts.
- [x] Add routing and global CSS.
- [x] Create reusable layout and component structure.
- [x] Add `.env.example` with placeholder names only.
- [x] Add README setup instructions.
- [x] Verify development server and production build.

## Phase 2 — Firebase Foundation
- [x] Document Firebase project setup.
- [x] Configure Firebase client initialization.
- [x] Enable Email/Password authentication instructions.
- [x] Configure Google sign-in instructions and authorized domains.
- [x] Define Firestore collections and model types.
- [x] Write least-privilege Firestore Security Rules.
- [x] Add Firestore indexes.
- [x] Configure Firebase Emulator Suite where practical.
- [x] Test authentication and basic authorized reads.
- [x] Confirm no secrets are committed.

## Phase 3 — Backend and Contracts
- [x] Initialize Cloud Functions with TypeScript.
- [x] Define common request/response/error format.
- [x] Implement input validation.
- [x] Implement product/category admin functions as needed.
- [x] Implement server-side coupon validation.
- [x] Implement secure order creation.
- [x] Implement atomic stock updates.
- [x] Add idempotency for order creation.
- [x] Implement authorized order lookup/tracking.
- [x] Implement cancellation and stock restoration rules.
- [x] Implement review validation/moderation operations.
- [x] Implement protected admin operations.
- [x] Add backend tests/type checks.
- [x] Document function contracts in `docs/api-contract.md`.

## Phase 4 — Design System and Customer UI
- [x] Implement global design tokens and typography.
- [x] Build header, footer, navigation, buttons, forms, and cards.
- [x] Build responsive Home page.
- [x] Build Shop and category pages.
- [x] Build search, filtering, and sorting.
- [x] Build Product Details page.
- [x] Build Cart page.
- [x] Build Checkout page.
- [x] Build Order Success page.
- [x] Build Order Tracking page.
- [x] Build Wishlist page.
- [x] Build Login/Register/Forgot Password.
- [x] Build Account/Profile and address management.
- [x] Build My Orders and Order Details.
- [x] Build Reviews and Ratings.
- [x] Build Offers/Coupons.
- [x] Build About, Contact, FAQ, and policy pages.
- [x] Build custom 404 page.
- [x] Add loading, empty, error, and success states.
- [x] Verify responsive behavior and accessibility basics.

## Phase 5 — Data Integration
- [x] Load public products/categories from Firestore or documented API.
- [x] Implement repository/service layer.
- [x] Implement guest cart persistence.
- [x] Implement authenticated cart strategy and merge behavior if enabled.
- [x] Integrate secure checkout function.
- [x] Display server-calculated totals.
- [x] Integrate order history and tracking.
- [x] Integrate reviews with eligibility checks.
- [x] Add pagination for growing collections.
- [x] Verify error and offline/network failure behavior.

## Phase 6 — Cloudinary
- [x] Document Cloudinary setup.
- [x] Implement secure upload strategy.
- [x] Validate image file type and size.
- [x] Store validated secure URLs and metadata.
- [x] Ensure secrets are not exposed to the browser.
- [x] Test image rendering and upload failures.

## Phase 7 — Admin Dashboard
- [x] Implement protected admin routes.
- [x] Verify server-enforced admin authorization.
- [x] Build dashboard summaries.
- [x] Implement product CRUD.
- [x] Implement category CRUD.
- [x] Implement order list, details, and status updates.
- [x] Implement customer management within authorized scope.
- [x] Implement review moderation.
- [x] Implement coupon management.
- [x] Implement banner management.
- [x] Implement store settings and seasonal theme publishing.
- [x] Add real-time customer support chat inbox.
- [x] Add confirmations, validation, and error states.
- [x] Test unauthorized admin requests are rejected.

## Phase 8 — Delivery Management & Live Tracking (Extension)
- [x] Define data models for delivery profiles, assignments, locations, archives, earnings, payments, and issues.
- [x] Configure least-privilege Firestore Security Rules for delivery collections.
- [x] Implement backend Cloud Functions for delivery role management (`handleSetDeliveryRole`) and dispatch assignment (`handleAssignDeliveryPerson`).
- [x] Implement rider tracking Cloud Functions (`handleStartDelivery`, `handleUpdateLocation`, `handleMarkHandedOver`).
- [x] Implement customer receipt confirmation and permanent order archive snapshot function (`handleConfirmCustomerReceipt`).
- [x] Implement dispute issue reporting function (`handleReportDeliveryIssue`).
- [x] Implement rider payout recording function with balance cap checks (`handleRecordDeliveryPayment`).
- [x] Create frontend `deliveryRepository` with Firestore live subscription & fallback event bus.
- [x] Build responsive Delivery Rider Portal (`/delivery/*`):
  - [x] Rider layout with live working availability switcher (`available`, `in_order`, `on_break`, `unavailable`).
  - [x] Delivery Dashboard with active task cards, direct customer call button, and Start/Handover workflows.
  - [x] Delivery History page with completed orders.
  - [x] Delivery Earnings ledger and payout receipt breakdown.
  - [x] Weekly Shift Schedule & workload management.
  - [x] Rider Profile with vehicle details and emergency contact.
- [x] Build interactive Leaflet + OpenStreetMap Live Tracking Map (`LiveOrderTrackingMap.tsx`):
  - [x] Proper OpenStreetMap attribution.
  - [x] Custom store marker (🥭), rider marker with animated radar pulse (🏍️), and customer pin (🏠).
  - [x] Automatic coordinate tracking and stale GPS warning (>5 min).
- [x] Build Customer Receipt Confirmation & Archive UI:
  - [x] Order details tracking toggle and handover banner.
  - [x] Independent customer receipt confirmation modal ("Yes, I Received My Order").
  - [x] Dispute issue reporting modal ("Report a Problem").
  - [x] Two-stage post-confirmation rating modal (product + delivery rider).
  - [x] Customer Permanent Order Archive page (`/account/archive`) with immutable snapshots.
- [x] Build Admin Delivery Management Pages:
  - [x] Delivery Personnel roster (`/admin/delivery-people`): add rider, promote user, suspend/activate.
  - [x] Rider Payout Management (`/admin/delivery-payments`): financial metrics, record payment modal.
  - [x] Delivery Dispute Tickets (`/admin/delivery-issues`): issue details, chat link, status resolution.
  - [x] Order dispatch assignment & reassignment modal in Order Details.
- [x] Update AuthContext and LoginPage with demo rider login buttons (`delivery@folmishti.com`).

## Phase 9 — Quality Assurance & Build Verification
- [x] Test Firestore Security Rules across customer, delivery, and admin collections.
- [x] Test customer isolation for orders and tracking data.
- [x] Run TypeScript compiler checks on `web/` (`tsc -b`).
- [x] Run TypeScript compiler checks on `functions/` (`tsc`).
- [x] Run static lint checks (`oxlint`).
- [x] Run production build (`vite build` in 2.17s, 0 errors).
- [x] Verify no secrets, private keys, or credentials committed to Git.

## Phase 10 — Documentation and Deployment Preparation
- [x] Update `PRD.md` with Delivery Rider roles and specifications.
- [x] Update `ARCHITECTURE.md` with delivery subsystem and Leaflet map details.
- [x] Update `RULES.md` with handover/receipt separation and rider privacy rules.
- [x] Update `DESIGN.md` with rider portal and map design specs.
- [x] Update `docs/database-schema.md` with all 7 delivery collections.
- [x] Update `docs/api-contract.md` with all 8 delivery Cloud Functions.
- [x] Update `MEMORY.md` with stable delivery decisions.
- [x] Update `progress.md` with completion log.

## Phase 11 — Future Flutter Preparation (No Flutter Code Yet)
- [x] Ensure collection schemas are documented for mobile developer reuse.
- [x] Ensure Cloud Functions contracts are documented for mobile HTTP/callable clients.
- [x] Ensure shared order/product/user models are documented.
- [x] Ensure status enums and delivery business rules are documented.
- [x] Ensure Cloudinary URL strategy is documented.
- [x] Ensure Leaflet/OSM coordinate schemas align with Flutter map packages (e.g. `flutter_map`).
- [x] Write `docs/flutter-integration-guide.md`.
- [x] Confirm no Flutter source files were created in this website phase.

## Definition of Done
A task is done only when implementation exists, the relevant checks have been performed, and actual limitations are recorded. Never mark a task complete based only on generated code that has not been inspected or tested.
