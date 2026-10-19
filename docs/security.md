# Fol Mishti (ফল মিষ্টি) — Security Architecture & Guidelines

## 1. Principles
Security is enforced on the server, not in the browser. Client-side route guards, disabled buttons, or hidden forms are UX enhancements, not security boundaries.

---

## 2. Mandatory Security Rules Enforced

### 2.1 Untrusted Client Totals & Prices
- The frontend submits only product IDs and requested quantities during checkout.
- Cloud Functions fetch active product prices directly from Firestore and recalculate subtotal, coupon discount, delivery fee, and grand total.
- Tampered client prices are completely disregarded.

### 2.2 Atomic Stock Operations & Prevention of Negative Inventory
- Stock decrements are executed inside Firestore `runTransaction` blocks.
- If stock is insufficient, the transaction immediately aborts with an error.

### 2.3 Single Stock Restoration on Order Cancellation
- An order can only be cancelled while in `pending` or `processing` status.
- When cancelled, stock is restored for each item and `stockRestored: true` is persisted.
- Subsequent calls are rejected to prevent double-restoring inventory.

### 2.4 Idempotency Protection
- Every checkout submission requires an `idempotencyKey`.
- If a customer double-clicks or experiences connection drops, repeated submissions with the same key return the existing order rather than creating duplicate orders or charging twice.

### 2.5 Admin Privilege Escalation Protection
- Normal users cannot alter their role or permissions.
- Firestore Security Rules strictly prohibit updating the `role` field from client writes.
- Admin status requires `{ admin: true }` custom claims verified via Firebase Admin SDK or presence in the server-managed `admins/{uid}` collection.

### 2.6 Customer Isolation
- Customers can only read and write their own orders (`resource.data.userId == request.auth.uid`).
- Customers can only access their own private support conversations and messages.
- No public endpoint exposes customer lists, addresses, or phone numbers.

### 2.7 Payment Integrity
- Initial payment method is Cash on Delivery (COD).
- Orders are initialized with `paymentStatus: 'pending'`.
- Status can only be updated to `'paid'` by an authenticated administrator upon physical cash collection or through future verified payment gateway webhook callbacks.

### 2.8 Credentials & Secrets
- Never commit `.env` or service account keys.
- Cloudinary API Secret is strictly restricted from browser bundles.
