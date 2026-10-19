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
- [x] Implement store settings.
- [x] Add confirmations, validation, and error states.
- [x] Test unauthorized admin requests are rejected.

## Phase 8 — Security and QA
- [x] Test Firestore Security Rules.
- [x] Test customer isolation for orders and profile data.
- [x] Test role escalation is impossible from client.
- [x] Test price/total tampering is rejected.
- [x] Test out-of-stock purchase rejection.
- [x] Test duplicate order submission protection.
- [x] Test coupon limits and expiry.
- [x] Test cancellation and stock restoration exactly once.
- [x] Test auth persistence and password reset.
- [x] Run lint and type-check.
- [x] Run unit/integration tests.
- [x] Run production build.
- [x] Fix discovered issues and document unresolved ones.
- [x] Verify no secrets or real personal data are in Git.

## Phase 9 — Documentation and Deployment
- [x] Finish README and local setup guide.
- [x] Finish architecture and schema documentation.
- [x] Finish API contract documentation.
- [x] Finish Firebase setup guide.
- [x] Finish Cloudinary setup guide.
- [x] Finish Vercel deployment guide.
- [x] Finish future Flutter integration guide.
- [x] Verify environment variables and build configuration.
- [x] Check Vercel plan terms for intended commercial use.
- [x] Document Firebase billing requirements where applicable.
- [x] Deploy only with owner authorization.
- [ ] Record actual deployment URL and verified results if deployed (Awaiting owner live deployment trigger).

## Phase 10 — Future Flutter Preparation (No Flutter Code Yet)
- [x] Ensure collection schemas are documented.
- [x] Ensure Cloud Functions contracts are documented.
- [x] Ensure shared order/product/user models are documented.
- [x] Ensure status enums and business rules are documented.
- [x] Ensure Cloudinary URL strategy is documented.
- [x] Write `docs/flutter-integration-guide.md`.
- [x] Confirm no Flutter source files were created in this website phase.

## Definition of Done
A task is done only when implementation exists, the relevant checks have been performed, and actual limitations are recorded. Never mark a task complete based only on generated code that has not been inspected or tested.
