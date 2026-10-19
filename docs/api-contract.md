# Fol Mishti (ফল মিষ্টি) — API Contract Documentation

## 1. Overview
All trusted business logic, financial calculations, and inventory updates are executed through Firebase Cloud Functions callable endpoints or backend transactions. Client-supplied prices, stock counts, and totals are never trusted directly.

---

## 2. Callable Cloud Functions

### 2.1 `createOrder`
**Authentication:** Required (Customer or Admin)  
**Description:** Atomic creation of order, server-side price lookup, stock decrement, coupon redemption, and idempotency check.

#### Request Payload:
```json
{
  "idempotencyKey": "string (unique per checkout submission)",
  "items": [
    {
      "productId": "prod-mango-1",
      "quantity": 2
    }
  ],
  "deliveryAddress": {
    "fullName": "তানভীর আহমেদ",
    "phone": "01712345678",
    "alternativePhone": "01812345678",
    "district": "ঢাকা",
    "city": "উত্তরা",
    "address": "বাড়ি ১২, রোড ৭, সেক্টর ৩",
    "deliveryNotes": "বিকেল ৫টার পর ডেলিভারি দিন"
  },
  "deliveryAreaId": "dhaka-north",
  "couponCode": "FOL20"
}
```

#### Success Response:
```json
{
  "success": true,
  "orderId": "ord-1718293021",
  "orderNumber": "FM-2026-84920",
  "total": 300,
  "status": "pending"
}
```

#### Error Codes:
- `unauthenticated`: User must be logged in.
- `invalid-argument`: Missing address, non-existent product, or invalid quantity.
- `failed-precondition`: Insufficient product stock or inactive product.

---

### 2.2 `cancelOrder`
**Authentication:** Required (Order Owner or Admin)  
**Description:** Cancels pending or processing orders and restores stock exactly once (`stockRestored: true`).

#### Request Payload:
```json
{
  "orderId": "ord-1718293021"
}
```

#### Success Response:
```json
{
  "success": true,
  "orderId": "ord-1718293021",
  "status": "cancelled"
}
```

---

### 2.3 `validateCoupon`
**Authentication:** Public / Optional  
**Description:** Validates coupon eligibility, dates, min order requirements, and usage limits server-side.

#### Request Payload:
```json
{
  "code": "FOL20",
  "subtotal": 1200
}
```

#### Success Response:
```json
{
  "isValid": true,
  "code": "FOL20",
  "discount": 200,
  "discountType": "percentage",
  "discountValue": 20
}
```

---

### 2.4 `publishTheme`
**Authentication:** Required (Admin Only)  
**Description:** Publishes an approved global seasonal theme to `settings/appearance`.

#### Request Payload:
```json
{
  "themeId": "mango" // 'default' | 'mango' | 'orange' | 'lychee' | 'mishti'
}
```

#### Success Response:
```json
{
  "success": true,
  "activeTheme": "mango",
  "updatedAt": "2026-10-19T21:40:00.000Z"
}
```

---

### 2.5 `setAdminRole`
**Authentication:** Required (Admin or First Admin Bootstrapping)  
**Description:** Sets Firebase Auth custom claim `{ admin: true }` and records admin document.

#### Request Payload:
```json
{
  "targetUid": "user-uid-here",
  "isAdmin": true
}
```
