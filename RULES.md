# Fol Mishti Website — Agent Rules

These rules are mandatory unless the project owner explicitly changes them.

## Scope Rules
1. Build the website first.
2. Do not create Flutter/Dart source files during this phase.
3. Prepare documentation and backend contracts for future Flutter reuse.
4. Do not claim that a service, account, deployment, or test is complete unless verified.

## Coding Rules
1. Use React + Vite + TypeScript and plain CSS3.
2. Do not add Tailwind or Bootstrap.
3. Prefer small, reusable, typed components.
4. Keep UI, state, data access, and business logic separated.
5. Avoid unnecessary dependencies.
6. Use consistent naming and formatting.
7. Do not leave required buttons inert.
8. Do not use fake success messages for backend operations.
9. Clearly label demo/seed data and never use it as production data.
10. Keep the project buildable after each milestone.

## Data and API Rules
1. Firestore is the authoritative database.
2. Use documented schemas and API contracts.
3. Validate inputs on the backend.
4. Treat client-provided prices, totals, discounts, stock, and roles as untrusted.
5. Critical inventory/order writes must be atomic and protected against duplicate submissions.
6. Keep order statuses and payment statuses consistent across the project.
7. Use pagination for collections that may grow.
8. Do not leak private user or order data.
9. Do not use a separate database for the future Flutter app.

## Delivery and Live Tracking Rules
1. **Handover vs. Confirmation Separation:** A delivery person marking an order "Handed Over" must NEVER be treated as customer receipt confirmation. Customer must independently confirm receipt ("Yes, I Received My Order") or report an issue.
2. **Delivery Role Escalation Protection:** Users cannot assign themselves delivery roles. Only an authorized administrator can register, promote, or suspend delivery personnel.
3. **Rider Privacy Protection:** Never expose delivery person IDs as customer-facing search keys or in customer URLs. Delivery rider live GPS coordinates in `/deliveryLocations/{orderId}` must be accessible only to the customer owning that active order, the assigned delivery person, and administrators.
4. **Free-to-Start Mapping & Leaflet:** Use Leaflet with standard OpenStreetMap tiles (`{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`). Always include proper OpenStreetMap contributors attribution. Provide clean, configurable tile endpoints without proprietary SDK lock-in.
5. **GPS Coordinate Range Validation:** All location updates must validate that latitude is between -90 and 90, and longitude is between -180 and 180.
6. **Earnings Ledger Idempotency:** Delivery earnings entries in `/deliveryEarnings` must be generated exactly once upon verified customer receipt confirmation.
7. **Admin Payout Cap:** Admin payout disbursements recorded in `/deliveryPayments` cannot exceed the rider's current payable balance.
8. **Permanent Order Archive Immutability:** Customer receipt confirmation snapshots the order into `/orderArchives/{orderId}` to permanently freeze purchase prices, discounts, delivery fees, items, and delivery audit timestamps.

## Security Rules
1. Never commit secrets, private keys, service-account files, signing keys, or real customer data.
2. Never expose Cloudinary API secrets in client code.
3. Never allow users to set their own admin or delivery role.
4. Enforce admin and delivery permissions in trusted backend logic and Security Rules.
5. Restrict customer access to their own private data.
6. Do not trust client-side route guards as authorization.
7. Do not mark an order paid without trusted payment verification.
8. Apply least privilege and test Security Rules.
9. Use safe error messages; do not expose stack traces or sensitive details to customers.
10. Do not store card numbers or CVV data.

## UI Rules
1. Follow `DESIGN.md`.
2. Support mobile, tablet, and desktop.
3. Provide loading, empty, error, and success states.
4. Use semantic elements, labels, keyboard support, and visible focus states.
5. Ensure Bengali text renders correctly.
6. Maintain a consistent visual design across pages.
7. Do not use random placeholder images in production-facing product listings.
8. Optimize images and avoid layout shifts where practical.

## Workflow Rules
1. Read `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `TASKS.md`, and `MEMORY.md` before starting.
2. Inspect the workspace before changing files.
3. Work in phases and update `progress.md`.
4. Run type-check, lint, tests, and build when available.
5. Report exact commands and actual outcomes.
6. Never say “all tests passed” if tests were not run.
7. Keep setup instructions current.
8. If credentials/configuration are missing, use placeholders and explain what the owner must do.
9. Do not overwrite unrelated user work.
10. Ask questions only when a decision blocks implementation; otherwise choose a sensible documented default.

## Deployment Rules
1. Never deploy without explicit owner authorization if deployment would publish or modify a live service.
2. Verify environment variables and build settings.
3. Confirm Vercel plan terms are suitable for the intended commercial use.
4. Explain that Firebase Cloud Functions may require a billing-enabled plan.
5. Document rollback and environment configuration.
