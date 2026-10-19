import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { ShopPage } from './pages/customer/ShopPage';
import { FruitsPage } from './pages/customer/FruitsPage';
import { SweetsPage } from './pages/customer/SweetsPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrderSuccessPage } from './pages/customer/OrderSuccessPage';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage';
import { WishlistPage } from './pages/customer/WishlistPage';
import { LoginPage } from './pages/customer/LoginPage';
import { RegisterPage } from './pages/customer/RegisterPage';
import { ForgotPasswordPage } from './pages/customer/ForgotPasswordPage';
import { AccountPage } from './pages/customer/AccountPage';
import { MyOrdersPage } from './pages/customer/MyOrdersPage';
import { OrderDetailsPage } from './pages/customer/OrderDetailsPage';
import { OffersPage } from './pages/customer/OffersPage';
import { AboutPage } from './pages/customer/AboutPage';
import { ContactPage } from './pages/customer/ContactPage';
import { FaqPage } from './pages/customer/FaqPage';
import { ShippingPolicyPage } from './pages/customer/ShippingPolicyPage';
import { ReturnRefundPage } from './pages/customer/ReturnRefundPage';
import { PrivacyPolicyPage } from './pages/customer/PrivacyPolicyPage';
import { TermsPage } from './pages/customer/TermsPage';
import { NotFoundPage } from './pages/customer/NotFoundPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminAddProductPage } from './pages/admin/AdminAddProductPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminOrderDetailsPage } from './pages/admin/AdminOrderDetailsPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminBannersPage } from './pages/admin/AdminBannersPage';
import { AdminAppearancePage } from './pages/admin/AdminAppearancePage';
import { AdminChatPage } from './pages/admin/AdminChatPage';
import { AdminDeliveryAreasPage } from './pages/admin/AdminDeliveryAreasPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminStockPage } from './pages/admin/AdminStockPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<CustomerLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="shop" element={<ShopPage />} />
                  <Route path="fruits" element={<FruitsPage />} />
                  <Route path="sweets" element={<SweetsPage />} />
                  <Route path="product/:id" element={<ProductDetailPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="order-success/:orderId" element={<OrderSuccessPage />} />
                  <Route path="order-tracking" element={<OrderTrackingPage />} />
                  <Route path="wishlist" element={<WishlistPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="account" element={<AccountPage />} />
                  <Route path="my-orders" element={<MyOrdersPage />} />
                  <Route path="order/:orderId" element={<OrderDetailsPage />} />
                  <Route path="offers" element={<OffersPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="faq" element={<FaqPage />} />
                  <Route path="shipping-policy" element={<ShippingPolicyPage />} />
                  <Route path="return-refund" element={<ReturnRefundPage />} />
                  <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="terms" element={<TermsPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="add-product" element={<AdminAddProductPage />} />
                  <Route path="edit-product/:id" element={<AdminAddProductPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="order/:id" element={<AdminOrderDetailsPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="reviews" element={<AdminReviewsPage />} />
                  <Route path="coupons" element={<AdminCouponsPage />} />
                  <Route path="banners" element={<AdminBannersPage />} />
                  <Route path="appearance" element={<AdminAppearancePage />} />
                  <Route path="chat" element={<AdminChatPage />} />
                  <Route path="delivery-areas" element={<AdminDeliveryAreasPage />} />
                  <Route path="reports" element={<AdminReportsPage />} />
                  <Route path="stock" element={<AdminStockPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                  <Route path="profile" element={<AdminProfilePage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
