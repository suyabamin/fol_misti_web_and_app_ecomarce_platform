# Fol Mishti (ফল মিষ্টি) — Firestore Database Schema

## 1. Overview
The database uses Google Cloud Firestore in native mode. All data is structured into top-level collections with subcollections for isolated sub-resources (such as conversation messages).

---

## 2. Collections Specification

### 2.1 `users/{userId}`
- **Purpose:** Customer profiles & saved addresses.
- **Fields:**
  - `uid` (string, primary key)
  - `displayName` (string)
  - `email` (string)
  - `phone` (string)
  - `role` ('customer' | 'admin')
  - `addresses` (array of `DeliveryAddress` objects)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

### 2.2 `products/{productId}`
- **Purpose:** Catalog of seasonal fruits and Bengali sweets.
- **Fields:**
  - `id` (string)
  - `name` (string, English)
  - `nameBn` (string, Bengali)
  - `slug` (string, unique)
  - `category` (string, e.g. 'fruits' | 'sweets' | 'mango-collection')
  - `unit` (string, e.g. 'প্রতি কেজি', 'মাটির সরা (১ কেজি)')
  - `price` (number, in BDT integer)
  - `discountPrice` (number, optional in BDT integer)
  - `stock` (number, current inventory)
  - `imageUrl` (string, Cloudinary secure URL)
  - `galleryImages` (array of strings)
  - `description` (string)
  - `descriptionBn` (string)
  - `isFeatured` (boolean)
  - `isSeasonal` (boolean)
  - `seasonType` ('mango' | 'orange' | 'lychee' | 'general')
  - `rating` (number, 1.0 to 5.0)
  - `reviewCount` (number)
  - `isActive` (boolean)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

### 2.3 `categories/{categoryId}`
- **Fields:** `id`, `name`, `nameBn`, `slug`, `description`, `imageUrl`, `sortOrder`, `isActive`.

### 2.4 `orders/{orderId}`
- **Purpose:** Authoritative record of purchases.
- **Fields:**
  - `orderNumber` (string, e.g. `FM-2026-84920`)
  - `idempotencyKey` (string, prevents duplicate orders)
  - `userId` (string, customer UID)
  - `userEmail` (string)
  - `items` (array of `OrderItem` snapshots)
  - `subtotal` (number, BDT)
  - `discount` (number, BDT)
  - `deliveryFee` (number, BDT)
  - `total` (number, BDT)
  - `currency` ('BDT')
  - `paymentMethod` ('cod')
  - `paymentStatus` ('pending' | 'paid' | 'failed' | 'refunded')
  - `status` ('pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled')
  - `deliveryAddress` (`DeliveryAddress` object)
  - `deliveryAreaId` (string)
  - `appliedCoupon` (string | null)
  - `statusHistory` (array of `{ status, timestamp, note }`)
  - `stockRestored` (boolean)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

### 2.5 `coupons/{couponId}`
- **Fields:** `code` (uppercase), `type` ('percentage' | 'fixed'), `value` (number), `minOrderAmount` (number), `maxDiscount` (number), `validFrom` (string), `validUntil` (string), `usageLimit` (number), `usageCount` (number), `isActive` (boolean).

### 2.6 `reviews/{reviewId}`
- **Fields:** `productId`, `productName`, `userId`, `userName`, `rating` (1-5), `comment`, `status` ('pending' | 'approved' | 'rejected'), `createdAt` (timestamp).

### 2.7 `settings/{documentId}`
- `settings/store`: Store name, phone, email, address, delivery fees, free delivery threshold, maintenance mode.
- `settings/appearance`: `activeTheme` ('default' | 'mango' | 'orange' | 'lychee' | 'mishti'), `themeVersion` (number), `updatedAt` (timestamp), `updatedBy` (admin UID).

### 2.8 `deliveryAreas/{areaId}`
- **Fields:** `id`, `name`, `nameBn`, `fee` (number), `estimatedHours` (string), `isActive` (boolean).

### 2.9 `supportConversations/{conversationId}`
- **Fields:** `userId`, `userName`, `userEmail`, `userPhone`, `status` ('open' | 'assigned' | 'closed'), `assignedToAdminId`, `lastMessageText`, `lastMessageTimestamp`, `unreadCountAdmin`, `unreadCountUser`, `createdAt`, `updatedAt`.
  - **Subcollection** `messages/{messageId}`: `conversationId`, `senderId`, `senderName`, `senderRole` ('customer' | 'admin'), `text`, `read`, `createdAt`.

---

## 3. Delivery Management & Tracking Collections

### 3.1 `deliveryProfiles/{deliveryPersonId}`
- **Purpose:** Official delivery personnel credentials, status, vehicle specs, and weekly schedule.
- **Fields:**
  - `id` (string, matches user UID)
  - `name` (string)
  - `email` (string)
  - `phone` (string)
  - `photoUrl` (string | null)
  - `vehicleType` ('motorbike' | 'bicycle' | 'van' | 'walking')
  - `vehicleNumber` (string)
  - `emergencyContact` (string)
  - `status` ('active' | 'suspended')
  - `workingStatus` ('available' | 'in_order' | 'on_break' | 'unavailable')
  - `activeOrdersCount` (number)
  - `rating` (number, 1.0 to 5.0)
  - `totalDeliveries` (number)
  - `schedule` (`DeliverySchedule` object: `workingDays`, `shiftStart`, `shiftEnd`, `breakStart`, `breakEnd`, `onLeaveToday`, `maxConcurrentOrders`)
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

### 3.2 `deliveryAssignments/{orderId}`
- **Purpose:** Current active delivery assignment linking an order to a delivery person.
- **Fields:**
  - `orderId` (string, primary key)
  - `orderNumber` (string)
  - `deliveryPersonId` (string)
  - `deliveryPersonName` (string)
  - `deliveryPersonPhone` (string)
  - `status` ('assigned' | 'out_for_delivery' | 'handed_over' | 'receipt_confirmed' | 'cancelled')
  - `assignedAt` (timestamp)
  - `assignedByAdminId` (string)
  - `reassignedFromId` (string | null)
  - `reassignmentReason` (string | null)
  - `startedAt` (timestamp | null)
  - `handedOverAt` (timestamp | null)
  - `confirmedAt` (timestamp | null)
  - `notes` (string | null)

### 3.3 `deliveryLocations/{orderId}`
- **Purpose:** Ephemeral live GPS coordinates of the delivery rider while out for delivery. Access restricted to active order owner, assigned delivery rider, and admins.
- **Fields:**
  - `orderId` (string, primary key)
  - `deliveryPersonId` (string)
  - `latitude` (number, valid range -90 to 90)
  - `longitude` (number, valid range -180 to 180)
  - `heading` (number | null, 0-360)
  - `speed` (number | null, km/h)
  - `accuracy` (number | null, meters)
  - `timestamp` (timestamp)

### 3.4 `orderArchives/{orderId}`
- **Purpose:** Permanent immutable order snapshot saved upon customer receipt confirmation. Preserves exact historical purchase price, discount, delivery fee, and address even if catalog products change later.
- **Fields:**
  - `orderId` (string, primary key)
  - `orderNumber` (string)
  - `userId` (string)
  - `customerName` (string)
  - `customerPhone` (string)
  - `items` (array of immutable item snapshots)
  - `subtotal` (number)
  - `discount` (number)
  - `deliveryFee` (number)
  - `total` (number)
  - `paymentMethod` ('cod')
  - `deliveryAddress` (`DeliveryAddress` object)
  - `deliveryPersonId` (string)
  - `deliveryPersonName` (string)
  - `deliveryPersonPhone` (string)
  - `confirmedAt` (timestamp)
  - `createdAt` (timestamp)
  - `canRate` (boolean)
  - `hasRated` (boolean)

### 3.5 `deliveryEarnings/{orderId}`
- **Purpose:** Financial ledger entry recording delivery person payout entitlement generated idempotently when receipt is confirmed.
- **Fields:**
  - `id` (string, orderId)
  - `orderId` (string)
  - `orderNumber` (string)
  - `deliveryPersonId` (string)
  - `deliveryPersonName` (string)
  - `baseDeliveryFee` (number, e.g. 50 BDT)
  - `distanceBonus` (number, optional)
  - `tip` (number, optional)
  - `commissionDeducted` (number)
  - `netEarning` (number, total BDT payable to rider)
  - `paymentStatus` ('pending' | 'paid')
  - `paymentId` (string | null)
  - `confirmedAt` (timestamp)
  - `createdAt` (timestamp)

### 3.6 `deliveryPayments/{paymentId}`
- **Purpose:** Record of payouts made by Admin to delivery riders (via Cash, bKash, Nagad, or Bank Transfer).
- **Fields:**
  - `id` (string)
  - `deliveryPersonId` (string)
  - `deliveryPersonName` (string)
  - `amount` (number, BDT, capped to outstanding payable balance)
  - `paymentMethod` ('cash' | 'bkash' | 'nagad' | 'bank_transfer')
  - `transactionReference` (string)
  - `paidAt` (timestamp)
  - `recordedByAdminId` (string)
  - `notes` (string | null)

### 3.7 `deliveryIssues/{issueId}`
- **Purpose:** Customer dispute tickets reported if customer clicks "Report a Problem" rather than confirming receipt.
- **Fields:**
  - `id` (string)
  - `orderId` (string)
  - `orderNumber` (string)
  - `userId` (string)
  - `deliveryPersonId` (string)
  - `issueType` ('missing_items' | 'damaged_goods' | 'wrong_order' | 'rider_did_not_arrive' | 'other')
  - `description` (string)
  - `status` ('open' | 'investigating' | 'resolved' | 'dismissed')
  - `resolutionNotes` (string | null)
  - `createdAt` (timestamp)
  - `resolvedAt` (timestamp | null)

