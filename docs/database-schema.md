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
