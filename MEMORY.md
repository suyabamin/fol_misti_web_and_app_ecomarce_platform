# Fol Mishti Website — Project Memory

This file contains stable project decisions. Read it before making architecture or implementation changes. Update it when the owner explicitly changes a decision.

## Product
- Project name: Fol Mishti
- Bengali name: ফল মিষ্টি
- Business: Ecommerce for seasonal fruits and Bengali sweets in Bangladesh
- Store currency: BDT (৳)

## Current Priority
- Build the WEBSITE FIRST.
- The website has not been implemented yet; the project currently has planning/prompts only unless the workspace proves otherwise.
- Do not create the Flutter app in this phase.
- Build a future-Flutter-compatible backend and document all contracts.

## Chosen Stack
- Web: React + Vite + TypeScript
- Styling: Plain CSS3; no Tailwind or Bootstrap
- Routing: React Router
- Database: Firebase Cloud Firestore
- Authentication: Firebase Authentication (Email/Password and Google sign-in)
- Backend: Firebase Cloud Functions with TypeScript
- Images: Cloudinary
- Hosting: Vercel, after verifying suitable plan terms
- Source control: GitHub
- Initial payment: Cash on Delivery (COD)
- Online payment: future phase only

## Future App
- Future target: Flutter + Dart for Android and iOS.
- The future app must use the same Firebase project, Authentication users, Firestore collections, Cloud Functions, business rules, and Cloudinary image URLs.
- Do not create a separate mobile database.
- Recreate the visual design in Flutter widgets; do not embed the website in a WebView.

## Product Requirements
- Full multi-page customer website.
- Protected admin dashboard.
- Product/category management.
- Cart, checkout, COD orders, order tracking, and order history.
- Wishlist, reviews, coupons, banners, and account management.
- About, Contact, FAQ, shipping/refund/privacy/terms pages.
- Responsive, accessible UI with Bangla and English support where practical.

## Security Decisions
- Client-supplied prices, totals, discounts, stock, and roles are untrusted.
- Server validates checkout and recalculates totals.
- Stock and order changes must be atomic and protected against duplicate submissions.
- Admin permissions must be enforced by trusted backend authorization and Security Rules.
- Never expose Cloudinary API secrets, service-account credentials, or private keys in client code.
- Do not mark payment as completed without trusted payment verification.
- Use least-privilege Firestore Security Rules.

## Workflow Preferences
- Work in phases, not one giant generation.
- Inspect workspace before editing.
- Keep `progress.md` updated.
- Report actual test results and configuration still required.
- Never claim deployment or tests succeeded without verification.
- Use placeholders until owner-provided configuration is available.
- Preserve unrelated existing work.

## External Setup Notes
- Firebase project and providers may need owner setup.
- Cloud Functions deployment may require a billing-enabled Firebase plan.
- Cloudinary account/upload configuration must be set up by the owner.
- Vercel plan terms should be checked for the intended commercial website.
- iOS build/distribution later requires suitable Apple tooling and account setup.

## Current State
- Planning and prompt design only, unless actual workspace inspection confirms more.
- No production backend, website, deployment, or tests should be assumed complete.
- Next action: inspect workspace, read all documentation, create architecture and implementation plan, then implement the website in milestones.
