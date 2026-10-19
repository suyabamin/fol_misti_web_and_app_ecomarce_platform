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

## 3. Suggested Color Tokens
Treat these as initial design tokens; adjust only if a supplied reference design requires it.

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
- Use a Bengali-capable font, such as Hind Siliguri or Noto Sans Bengali, with suitable fallbacks.
- Use a clean sans-serif for English.
- Define a consistent type scale for display headings, page headings, section headings, body text, captions, and labels.
- Keep body text comfortable to read; do not use tiny text for prices or important actions.
- Verify Bengali glyphs on Windows, Android browsers, and common mobile sizes.

## 5. Layout and Spacing
Use a consistent spacing scale, for example 4, 8, 12, 16, 24, 32, 48, and 64 px.
- Set a readable maximum content width.
- Use consistent page gutters.
- Keep product grids responsive.
- Ensure sticky headers do not obscure page content.
- Respect mobile safe areas where applicable.

## 6. Shared Components
Create reusable components for:
- Announcement bar
- Header and navigation
- Mobile navigation/menu
- Search field
- Category tile
- Product card
- Price display
- Stock badge
- Quantity selector
- Rating display
- Coupon input
- Cart item
- Address form
- Order status badge
- Pagination/load more
- Breadcrumbs
- Modal/dialog
- Toast/alert
- Skeleton/loading state
- Empty state
- Error state
- Footer
- Admin sidebar/header
- Admin data table and filters

## 7. Customer Website Structure
### Header
- Brand mark and Bengali/English name
- Main navigation
- Search
- Account
- Wishlist
- Cart count
- Responsive mobile menu

### Home
- Hero section with a clear shopping CTA
- Featured categories
- Seasonal products
- Featured fruits and sweets
- Offers/banners loaded from backend
- Trust/delivery information
- Footer with policies and contact details

### Shop and category pages
- Clear page title and breadcrumb
- Search/filter/sort controls where supported
- Responsive product grid
- Loading skeletons
- Empty and error states

### Product details
- Image gallery
- Product name and unit
- Price and optional previous price
- Availability/stock status
- Description
- Quantity selector
- Add-to-cart CTA
- Rating/review section
- Related products where available

### Cart and checkout
- Clear itemized summary
- Quantity controls and removal
- Delivery/contact form
- Coupon validation feedback
- Delivery fee and final total
- COD method clearly identified
- Disable repeated submissions while processing
- Show confirmation only after successful backend response

### Account and orders
- Clear account navigation
- Order history with readable statuses
- Order details and status history
- Friendly empty states

## 8. Admin Design
- Separate admin layout
- Sidebar navigation on wide screens and suitable mobile navigation
- Dashboard summary cards
- Tables with pagination and filters
- Clear create/edit forms
- Confirmation for destructive actions
- Visible validation errors
- Loading and empty states
- Do not rely on color alone to convey status

## 9. Responsive Behavior
- Mobile-first CSS
- Avoid horizontal overflow
- Product grid columns adapt to viewport width
- Tables may scroll horizontally or switch to cards on narrow screens
- Forms use comfortable touch targets
- Navigation and dialogs work with keyboard and touch
- Test at small mobile, large mobile, tablet, laptop, and wide desktop sizes

## 10. Accessibility
- Semantic HTML
- Labels for all form controls
- Useful alt text for product images
- Visible keyboard focus
- Keyboard-operable menus and dialogs
- Sufficient color contrast
- Respect reduced-motion preferences
- Do not communicate errors or status by color alone

## 11. Motion and Feedback
Use restrained transitions for hover, focus, cart updates, and menus. Avoid distracting animations. All actions should have visible feedback, and async actions should show progress.

## 12. Design Reference Images
If the owner supplies a screenshot, extract its layout, palette, typography, spacing, card shapes, and interaction patterns. Treat it as a reference, not as permission to remove required accessibility or responsive behavior.

## 13. Future Flutter Consistency
Document design tokens and reusable component intent so the future Flutter app can reproduce the same brand. The app must implement its UI with Flutter widgets, not embed the website in a WebView.
