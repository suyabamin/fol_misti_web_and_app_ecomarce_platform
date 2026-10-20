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

---

## 3. Delivery Management & Tracking Cloud Functions

### 3.1 `setDeliveryRole`
**Authentication:** Required (Admin Only)  
**Description:** Grants or revokes the `delivery` custom claim for a user and initializes or updates their `/deliveryProfiles/{uid}` document.

#### Request Payload:
```json
{
  "targetUid": "user-uid-here",
  "isDelivery": true,
  "profile": {
    "name": "রাকিব হাসান",
    "phone": "01711223344",
    "vehicleType": "motorbike",
    "vehicleNumber": "ঢাকা মেট্রো-হ-১২-৩৪৫৬",
    "emergencyContact": "01811223344",
    "schedule": {
      "workingDays": [0, 1, 2, 3, 4],
      "shiftStart": "08:00",
      "shiftEnd": "18:00",
      "breakStart": "13:00",
      "breakEnd": "14:00",
      "onLeaveToday": false,
      "maxConcurrentOrders": 3
    }
  }
}
```

#### Success Response:
```json
{
  "success": true,
  "targetUid": "user-uid-here",
  "isDelivery": true
}
```

---

### 3.2 `assignDeliveryPerson`
**Authentication:** Required (Admin Only)  
**Description:** Assigns or reassigns an order to a delivery rider. Validates working schedule, shift hours, and concurrent order limits. If reassigned, revokes previous rider's tracking session and logs reassignment reason audit trail.

#### Request Payload:
```json
{
  "orderId": "ord-1718293021",
  "deliveryPersonId": "rider-uid-here",
  "notes": "ডেলিভারি দ্রুত সম্পন্ন করুন",
  "reassignmentReason": "Previous rider bike breakdown (if reassigned)"
}
```

#### Success Response:
```json
{
  "success": true,
  "orderId": "ord-1718293021",
  "deliveryPersonId": "rider-uid-here",
  "status": "assigned"
}
```

---

### 3.3 `startDelivery`
**Authentication:** Required (Assigned Delivery Rider Only)  
**Description:** Sets order status to `out_for_delivery`, sets rider working status to `in_order`, and activates GPS tracking session.

#### Request Payload:
```json
{
  "orderId": "ord-1718293021",
  "initialLocation": {
    "latitude": 23.8103,
    "longitude": 90.4125,
    "heading": 90,
    "speed": 25,
    "accuracy": 8
  }
}
```

#### Success Response:
```json
{
  "success": true,
  "orderId": "ord-1718293021",
  "status": "out_for_delivery"
}
```

---

### 3.4 `updateLocation`
**Authentication:** Required (Assigned Delivery Rider Only)  
**Description:** Updates real-time GPS coordinates in `/deliveryLocations/{orderId}`. Strictly validates latitude (-90 to 90) and longitude (-180 to 180). Rejects updates if order is not in `out_for_delivery` state.

#### Request Payload:
```json
{
  "orderId": "ord-1718293021",
  "latitude": 23.8115,
  "longitude": 90.4140,
  "heading": 120,
  "speed": 32,
  "accuracy": 5
}
```

#### Success Response:
```json
{
  "success": true,
  "timestamp": "2026-10-20T10:15:30.000Z"
}
```

---

### 3.5 `markHandedOver`
**Authentication:** Required (Assigned Delivery Rider Only)  
**Description:** Rider marks package as handed over to the customer. Sets status to `handed_over`. **Critical note:** This does NOT count as customer receipt confirmation; order remains pending customer verification.

#### Request Payload:
```json
{
  "orderId": "ord-1718293021",
  "recipientName": "আহমেদ সাদিক (গ্রাহক নিজে)",
  "handoverNotes": "প্যাকেজ এবং ক্যাশ রিসিভ করা হয়েছে"
}
```

#### Success Response:
```json
{
  "success": true,
  "orderId": "ord-1718293021",
  "status": "handed_over",
  "requiresCustomerConfirmation": true
}
```

---

### 3.6 `confirmCustomerReceipt`
**Authentication:** Required (Order Owner or Admin)  
**Description:** Customer independently confirms package delivery. Atomically updates order to `receipt_confirmed`, marks payment as `paid` for COD, creates immutable snapshot in `/orderArchives/{orderId}`, and idempotently generates rider payout entry in `/deliveryEarnings/{orderId}`.

#### Request Payload:
```json
{
  "orderId": "ord-1718293021",
  "customerNotes": "ফল অত্যন্ত তাজা এবং মিষ্টি খুব সুস্বাদু ছিল"
}
```

#### Success Response:
```json
{
  "success": true,
  "orderId": "ord-1718293021",
  "status": "receipt_confirmed",
  "archiveId": "ord-1718293021",
  "earningsCreated": true,
  "canRate": true
}
```

---

### 3.7 `reportDeliveryIssue`
**Authentication:** Required (Order Owner or Admin)  
**Description:** Customer reports a delivery dispute or damaged items instead of confirming receipt. Changes status to `delivery_issue` and files an issue ticket in `/deliveryIssues`.

#### Request Payload:
```json
{
  "orderId": "ord-1718293021",
  "issueType": "damaged_goods",
  "description": "মিষ্টির বক্স ক্ষতিগ্রস্ত ছিল"
}
```

#### Success Response:
```json
{
  "success": true,
  "issueId": "iss-1718293021",
  "status": "delivery_issue"
}
```

---

### 3.8 `recordDeliveryPayment`
**Authentication:** Required (Admin Only)  
**Description:** Admin records payout distribution to delivery rider. Capped to rider's current outstanding payable balance. Atomically marks earnings records as `paid` and creates record in `/deliveryPayments`.

#### Request Payload:
```json
{
  "deliveryPersonId": "rider-uid-here",
  "amount": 450,
  "paymentMethod": "bkash",
  "transactionReference": "BKS-8291048",
  "notes": "সাপ্তাহিক ডেলিভারি বিল পরিশোধ"
}
```

#### Success Response:
```json
{
  "success": true,
  "paymentId": "pay-1718293021",
  "amount": 450,
  "remainingPayable": 0
}
```

