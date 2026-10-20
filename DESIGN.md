# Fol Mishti Website — UI/UX Design System

## 1. Brand Direction
**Brand:** Fol Mishti (ফল মিষ্টি)

The experience should feel fresh, warm, trustworthy, modern, and locally relevant to Bangladesh. It sells seasonal fruits and Bengali sweets, so the visual identity should balance freshness with a welcoming, traditional touch.

## 2. Design Principles
- Product photography is the main visual focus.
- Keep shopping flows simple and obvious.
- Use a consistent layout and spacing system.
- Make Bangla and English content readable.
- Avoid clutter, excessive gradients, and unnecessary animation.
- Use clear price, unit, stock, delivery, and CTA information.
- Use responsive layouts rather than shrinking desktop layouts on mobile.

## 3. Color Tokens
```css
:root {
  --color-brand: #18794E;
  --color-brand-dark: #105C3A;
  --color-brand-soft: #E8F5EC;
  --color-accent: #F4A62A;
  --color-accent-soft: #FFF3D6;
  --color-text: #202820;
  --color-text-muted: #657168;
  --color-background: #FFFFFF;
  --color-surface: #F7F9F6;
  --color-border: #E1E7E1;
  --color-danger: #C62828;
  --color-success: #247A43;
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --shadow-card: 0 6px 24px rgba(20, 50, 30, 0.08);
}
```

## 4. Typography
- Use Bengali font (Hind Siliguri / Noto Sans Bengali) with system fallbacks.
- Clean sans-serif for numbers and English text.
- Consistent type scale: Display (32px), H1 (24-28px), H2 (20-22px), Body (15-16px), Caption (13px), Small (11-12px).
- Legible Bengali numerals (১, ২, ৩...) and English numbers.

## 5. Layout and Spacing
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 px.
- Max content width: 1200px.
- Responsive gutters: 16px on mobile, 24px on tablet, 32px on desktop.

## 6. Shared Components
- Header and navigation with Bangla/English text
- Live customer chat floating widget
- Product cards with seasonal tags and price per unit
- Order status badges: `pending`, `preparing`, `ready_for_dispatch`, `assigned`, `out_for_delivery`, `handed_over`, `receipt_confirmed`, `delivery_issue`, `cancelled`
- Plain CSS3 modal dialogs and alert banners

## 7. Delivery Portal Design (`/delivery/*`)
- **Header with Live Working Status Pill:** Delivery rider can toggle between `available` (green), `in_order` (amber), `on_break` (blue), and `unavailable` (gray) at any time.
- **Mobile-First Rider Navigation:** Sticky top bar with quick-switch tabs: Active Tasks, History, Earnings, Schedule, Profile.
- **Active Task Cards:** Customer name, phone call shortcut (`tel:01...`), delivery address, COD collection amount, and 2 prominent action buttons:
  - "Start Delivery" (initiates GPS watch).
  - "Mark Handed Over" (modal with recipient name and notes).
- **Earnings Ledger View:** Summary cards (Net Earned, Paid Out, Payable Balance) and itemized delivery fee ledger.

## 8. Interactive Map Design (Leaflet + OpenStreetMap)
- Container: Border radius 14px, subtle border, min-height 380px, responsive 100% width.
- Tile Layer: OpenStreetMap with clean, standard tiles and obligatory attribution at bottom right (`© OpenStreetMap contributors`).
- Custom Leaflet DivIcons:
  - **Store Marker:** Green badge with 🥭 icon and "ফল মিষ্টি হাব" label.
  - **Rider Marker:** Circular badge with 🏍️ icon and an expanding semi-transparent CSS radar pulse animation (`@keyframes pulse-radar`) to indicate active live movement.
  - **Customer Destination:** Orange pin with 🏠 icon and customer recipient name.
- Stale GPS Notification Banner: Yellow warning ribbon rendered above map if rider coordinates have not refreshed in >5 minutes.

## 9. Handover, Receipt Confirmation & Rating Modals
- **Handover Notification Banner:** Displayed on Order Details and Order Tracking pages when status is `handed_over`. Informs customer that the rider has marked package delivered, prompting customer confirmation.
- **"Yes, I Received My Order" Action:** Primary green CTA button opening quick confirmation modal.
- **"Report a Problem" Action:** Secondary red/amber text button opening dispute reporting modal with issue type selector (`missing_items`, `damaged_goods`, `wrong_order`, `rider_did_not_arrive`, `other`).
- **Post-Confirmation Rating Dialog:** Two-stage 5-star rating for:
  1. Product quality (1 to 5 stars).
  2. Delivery rider speed and courtesy (1 to 5 stars).

## 10. Future Flutter Consistency
All UI components use design tokens matching the web implementation. When the native Flutter mobile app is created, these exact hex codes, spacing increments, and typography scales will be converted directly into Flutter `ThemeData` and custom widget themes.
