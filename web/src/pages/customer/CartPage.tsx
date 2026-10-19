import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './CartPage.css';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discount,
    deliveryFee,
    total,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    await applyCoupon(couponCode.trim());
    setCouponLoading(false);
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page container">
        <div className="cart-empty-state">
          <div className="empty-cart-icon-wrap">
            <ShoppingBag size={56} className="empty-icon" />
          </div>
          <h2>আপনার শপিং কার্ট খালি</h2>
          <p>আপনি এখনো কার্টে কোনো ফল বা মিষ্টি যুক্ত করেননি।</p>
          <Link to="/shop" className="btn btn-primary btn-lg">
            <span>শপিং শুরু করুন</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <Link to="/">হোম</Link>
        <span>/</span>
        <span className="current">শপিং কার্ট</span>
      </div>

      <div className="cart-header-title-row">
        <h1 className="cart-page-title">শপিং কার্ট ({cart.length} টি আইটেম)</h1>
        <button className="clear-cart-btn" onClick={clearCart}>
          <Trash2 size={16} /> কার্ট খালি করুন
        </button>
      </div>

      <div className="cart-layout">
        {/* Cart Items Table */}
        <div className="cart-items-col">
          <div className="cart-table-wrap">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>পণ্য</th>
                  <th>একক মূল্য</th>
                  <th>পরিমাণ</th>
                  <th>মোট</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => {
                  const itemPrice = item.product.discountPrice || item.product.price;
                  const lineTotal = itemPrice * item.quantity;
                  return (
                    <tr key={item.product.id}>
                      <td className="product-col-cell">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.nameBn}
                          className="cart-item-img"
                        />
                        <div className="cart-item-info">
                          <Link to={`/product/${item.product.id}`} className="cart-item-title">
                            {item.product.nameBn}
                          </Link>
                          <span className="cart-item-unit">{item.product.unit}</span>
                        </div>
                      </td>
                      <td className="price-cell">৳{itemPrice}</td>
                      <td>
                        <div className="cart-quantity-stepper">
                          <button
                            className="cart-step-btn"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="cart-step-qty">{item.quantity}</span>
                          <button
                            className="cart-step-btn"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="line-total-cell">৳{lineTotal}</td>
                      <td>
                        <button
                          className="cart-remove-btn"
                          onClick={() => removeFromCart(item.product.id)}
                          title="সরিয়ে ফেলুন"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="cart-actions-bottom">
            <Link to="/shop" className="btn btn-subtle">
              ← শপিং চালিয়ে যান
            </Link>
          </div>
        </div>

        {/* Order Summary & Coupon */}
        <div className="cart-summary-col">
          {/* Coupon Box */}
          <div className="summary-card coupon-box">
            <h4 className="summary-card-title">
              <Tag size={18} /> ডিসকাউন্ট কুপন
            </h4>

            {appliedCoupon ? (
              <div className="applied-coupon-row">
                <div className="applied-code-badge">
                  <Check size={16} />
                  <span>{appliedCoupon.code} প্রয়োগ করা হয়েছে (-৳{discount})</span>
                </div>
                <button className="remove-coupon-btn" onClick={removeCoupon}>
                  বাতিল
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="coupon-form">
                <input
                  type="text"
                  placeholder="যেমন: FOL20 বা MISHTI100"
                  className="coupon-input"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-coupon"
                  disabled={couponLoading || !couponCode.trim()}
                >
                  {couponLoading ? '...' : 'প্রয়োগ'}
                </button>
              </form>
            )}

            {couponError && (
              <div className="coupon-error-msg">
                <AlertCircle size={14} />
                <span>{couponError}</span>
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="summary-card pricing-summary">
            <h3 className="summary-card-title">অর্ডার সামারি</h3>

            <div className="summary-row">
              <span>সাবটোটাল</span>
              <span>৳{subtotal}</span>
            </div>

            {discount > 0 && (
              <div className="summary-row discount-row">
                <span>কুপন ছাড়</span>
                <span>-৳{discount}</span>
              </div>
            )}

            <div className="summary-row">
              <span>আনুমানিক ডেলিভারি চার্জ</span>
              <span>৳{deliveryFee}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total-row">
              <span>সর্বমোট প্রদেয়</span>
              <span className="total-val">৳{total}</span>
            </div>

            <p className="summary-note">
              * ডেলিভারি এরিয়া চেকআউট পেজে পরিবর্তন করা যাবে।
            </p>

            <button
              className="btn btn-primary btn-lg btn-checkout-main"
              onClick={() => navigate('/checkout')}
            >
              <span>চেকআউট করুন</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
