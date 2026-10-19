# Fol Mishti (ফল মিষ্টি) — Future Flutter Mobile Application Integration Guide

## 1. Overview
The Fol Mishti e-commerce platform is architected with a shared backend philosophy. The future Flutter mobile application (for Android and iOS) will connect to the exact same Firebase backend, Authentication users, Firestore collections, Cloud Functions, and Cloudinary media assets as the website.

> [!IMPORTANT]
> No Flutter or Dart source files were created during this website phase. The mobile application will be built as a native Flutter codebase recreating the UI using native Flutter widgets (not a WebView wrapper).

---

## 2. Shared Architecture Diagram
```text
           +---------------------------------------+
           |           Google Cloud / Firebase     |
           |              Project: fol-mishti      |
           +-------------------+-------------------+
                               |
         +---------------------+---------------------+
         |                                           |
+--------v---------+                       +---------v--------+
| React Web Client |                       | Future Flutter App|
| (Vite + TS)      |                       | (Android & iOS)  |
+------------------+                       +------------------+
         |                                           |
         +---------------------+---------------------+
                               |
          +--------------------+--------------------+
          | - Firebase Authentication (Email/Google)|
          | - Cloud Firestore (Same Collections)    |
          | - Cloud Functions (Same Callables)      |
          | - Firestore Security Rules (Same Rules) |
          | - Cloudinary Image CDN (Same Assets)    |
          +-----------------------------------------+
```

---

## 3. Recommended Flutter Dependencies
When starting the Flutter phase, add the official FlutterFire plugins to `pubspec.yaml`:
```yaml
dependencies:
  flutter:
    sdk: flutter
  firebase_core: ^3.0.0
  firebase_auth: ^5.0.0
  cloud_firestore: ^5.0.0
  cloud_functions: ^5.0.0
  google_sign_in: ^6.2.0
  cached_network_image: ^3.3.1
  provider: ^6.1.2 # or riverpod / bloc
```

---

## 4. Reusing Shared Firestore Collections
The Flutter app will directly query the same Firestore collections documented in `docs/database-schema.md`:
- `products`: Public read of available seasonal fruits and sweets.
- `categories`: Public read of categories.
- `orders`: Authenticated customer reads their own orders (`userId == currentUid`).
- `reviews`: Public read of approved reviews.
- `coupons`: Public read of active coupons.
- `banners`: Homepage campaign sliders.
- `settings/appearance`: Active seasonal theme (`activeTheme: 'mango' | 'orange' | ...`).
- `settings/store`: Store hotline, delivery fees, and address.
- `supportConversations`: Real-time chat stream with admin.

---

## 5. Reusing Shared Cloud Functions Callables
All financial transactions and stock reservations must be invoked via `cloud_functions`:

```dart
// Dart snippet for calling the authoritative createOrder Cloud Function:
final HttpsCallable callable = FirebaseFunctions.instance.httpsCallable('createOrder');
final response = await callable.call(<String, dynamic>{
  'idempotencyKey': 'idemp-${DateTime.now().millisecondsSinceEpoch}',
  'items': [
    {'productId': 'prod-mango-1', 'quantity': 2}
  ],
  'deliveryAddress': {
    'fullName': 'তানভীর আহমেদ',
    'phone': '01712345678',
    'district': 'ঢাকা',
    'city': 'উত্তরা',
    'address': 'বাড়ি ১২, রোড ৭, সেক্টর ৩'
  },
  'deliveryAreaId': 'dhaka-north',
  'couponCode': 'FOL20'
});

final orderId = response.data['orderId'];
final orderNumber = response.data['orderNumber'];
```

---

## 6. Shared Enums & Status Definitions

### Order Status:
```dart
enum OrderStatus {
  pending,    // অর্ডার গৃহীত
  processing, // প্রক্রিয়াকরণ
  shipped,    // শিপিং বা ডেলিভারির পথে
  delivered,  // সফলভাবে ডেলিভার্ড
  cancelled   // বাতিল
}
```

### Payment Status:
```dart
enum PaymentStatus {
  pending,  // বকেয়া (ক্যাশ অন ডেলিভারিতে প্রদেয়)
  paid,     // পরিশোধিত
  failed,   // ব্যর্থ
  refunded  // ফেরত
}
```

### Seasonal Themes:
```dart
enum SeasonalTheme {
  defaultTheme, // Fol Mishti Signature Green (#156b3c)
  mango,        // Mango Yellow (#f59e0b)
  orange,       // Citrus Orange (#ea580c)
  lychee,       // Lychee Pink/Red (#e11d48)
  mishti        // Royal Maroon (#881337)
}
```

---

## 7. Cloudinary Image Strategy
All image URLs stored in Firestore (e.g. `p.imageUrl`) are standard HTTPS CDN URLs. Flutter widgets can render them with `CachedNetworkImage`:
```dart
CachedNetworkImage(
  imageUrl: product.imageUrl,
  placeholder: (context, url) => CircularProgressIndicator(),
  errorWidget: (context, url, error) => Icon(Icons.error),
)
```
