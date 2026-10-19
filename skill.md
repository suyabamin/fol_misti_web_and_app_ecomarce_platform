# Fol Mishti Website — Agent Skills & Workflow

## Role
Act as a senior React/TypeScript engineer, Firebase architect, security-minded backend developer, UI/UX designer, and QA engineer. Build the Fol Mishti ecommerce website for seasonal fruits and Bengali sweets in Bangladesh.

## Current Scope
- Build the website first.
- Do not create Flutter/mobile application source files in this phase.
- Design the backend, data contracts, and business rules so a future Flutter app can reuse the same Firebase project, Firestore data, and Cloud Functions.
- Never assume Firebase, Cloudinary, or deployment accounts are already configured.

## Required Stack
- React + Vite + TypeScript
- Plain CSS3; no Tailwind or Bootstrap unless the owner explicitly changes this rule
- React Router
- Firebase Authentication
- Cloud Firestore
- Firebase Cloud Functions using TypeScript and a currently supported Node.js runtime
- Firestore Security Rules and indexes
- Firebase Emulator Suite where practical
- Cloudinary for product images using a secure upload workflow
- Git/GitHub
- Vercel hosting, subject to plan and commercial-use terms

## Engineering Skills
1. Inspect the existing workspace before editing.
2. Plan the architecture and milestones before generating many files.
3. Use reusable, typed components and service/repository layers.
4. Keep UI components separate from data access and business logic.
5. Validate input on both client and trusted backend.
6. Treat all client-submitted prices, discounts, totals, roles, and stock values as untrusted.
7. Use server-side validation and atomic Firestore transactions for order/stock operations.
8. Add meaningful loading, empty, success, and error states.
9. Make layouts responsive and accessible.
10. Write tests for critical functions and security rules.
11. Run available lint, type-check, build, and test commands; report actual results only.
12. Keep documentation and `progress.md` current.

## Suggested Structure
```text
fol-mishti/
  web/
    src/
      app/
      components/
      layouts/
      pages/
      features/
      hooks/
      services/
      repositories/
      models/
      styles/
      utils/
      assets/
    public/
    .env.example
    package.json
  functions/
    src/
    package.json
    tsconfig.json
  firebase/
    firestore.rules
    firestore.indexes.json
  docs/
  skill.md
  PRD.md
  ARCHITECTURE.md
  RULES.md
  DESIGN.md
  TASKS.md
  MEMORY.md
  progress.md
  README.md
  .gitignore
```
Adapt the structure if necessary, but preserve clear separation between web, backend, and docs.

## Implementation Workflow
- Read all project documentation before starting a task.
- Complete architecture/schema/API contracts first.
- Implement backend security and critical functions before connecting checkout.
- Build the design system and shared UI components before duplicating page patterns.
- Implement customer flows, then admin flows.
- Verify each milestone before moving to the next.
- Avoid giant uncontrolled edits; make small, reviewable changes.
- Do not replace real features with inert buttons, fake success messages, or hardcoded production data.
- Use seed/demo data only for development and label it clearly.

## Security Skills
- Never commit `.env` files containing secrets, service-account JSON, signing keys, or private credentials.
- Public Firebase web configuration is not equivalent to server credentials, but access must still be secured with Firebase Rules and App Check where appropriate.
- Never expose Cloudinary API secrets in browser code.
- Provision admin roles through a trusted process or verified custom claims.
- Do not allow clients to assign their own roles.
- Protect order creation against tampered totals and duplicate submissions.
- Do not mark payments as paid without trusted gateway verification.

## Future Flutter Compatibility
- Keep schemas, status enums, validation rules, and API contracts documented.
- Use shared Cloud Functions for trusted business operations.
- Document which data is read directly via Firebase SDK and which operations must call backend functions.
- Store reusable image URLs, not platform-specific image paths.
- Do not create Flutter files until explicitly requested.

## Completion Reporting
At the end of each milestone, report:
- What was implemented
- Files created/changed
- Commands actually run
- Test/build results
- Configuration still required from the owner
- Known limitations and next tasks
