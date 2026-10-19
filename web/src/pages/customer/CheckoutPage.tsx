import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { settingsRepository } from '../../repositories/settingsRepository';
import { orderRepository } from '../../repositories/orderRepository';
import { DeliveryArea, Order, OrderItem } from '../../models';
import './CheckoutPage.css';

export const CheckoutPage: React.FC = () => {
  const { cart, subtotal, discount, deliveryFee, setDeliveryFee, total, appliedCoupon, clearCart } = useCart();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('dhaka-north');

  // Form Fields
  const [fullName, setFullName] = useState(userProfile?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [altPhone, setAltPhone] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadAreas() {
      const areas = await settingsRepository.getDeliveryAreas();
      setDeliveryAreas(areas);
      if (areas.length > 0) {
        setSelectedAreaId(areas[0].id);
        setDeliveryFee(areas[0].fee);
      }
    }
    loadAreas();
  }, [setDeliveryFee]);

  const handleAreaChange = (areaId: string) => {
    setSelectedAreaId(areaId);
    const area = deliveryAreas.find(a => a.id === areaId);
    if (area) {
      setDeliveryFee(area.fee);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।');
      return;
    }
    if (!phone.trim() || phone.trim().length < 11) {
      setErrorMessage('সঠিক ১১ ডিজিটের মোবাইল নম্বর প্রদান করুন।');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।');
      return;
    }

    setIsSubmitting(true);

    try {
      const idempotencyKey = `idemp-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`;
      const randomOrderNum = `FM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      const orderItems: OrderItem[] = cart.map(item => {
        const itemPrice = item.product.discountPrice || item.product.price;
        return {
          productId: item.product.id,
          name: item.product.name,
          nameBn: item.product.nameBn,
          price: itemPrice,
          unit: item.product.unit,
          quantity: item.quantity,
          imageUrl: item.product.imageUrl,
          total: itemPrice * item.quantity
        };
      });

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: randomOrderNum,
        userId: currentUser?.uid || 'guest-order',
        userEmail: currentUser?.email || '',
        items: orderItems,
        subtotal,
        discount,
        deliveryFee,
        total,
        currency: 'BDT',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        status: 'pending',
        deliveryAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          alternativePhone: altPhone.trim() || undefined,
          district: district.trim(),
          city: city.trim() || district.trim(),
          address: address.trim(),
          deliveryNotes: deliveryNotes.trim() || undefined
        },
        deliveryAreaId: selectedAreaId,
        appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date().toISOString(),
            note: 'অর্ডারটি সফলভাবে জমা হয়েছে (ক্যাশ অন ডেলিভারি)।'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const created = await orderRepository.create(newOrder);
      clearCart();
      navigate(`/order-success/${created.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page container">
      {/* Checkout Progress Stepper */}
      <div className="checkout-stepper">
        <div className="step-item completed">
          <div className="step-num"><CheckCircle2 size={16} /></div>
          <span>শপিং কার্ট</span>
        </div>
        <div className="step-line active"></div>
        <div className="step-item active">
          <div className="step-num">২</div>
          <span>চেকআউট ও ঠিকানা</span>
        </div>
        <div className="step-line"></div>
        <div className="step-item">
          <div className="step-num">৩</div>
          <span>অর্ডার সম্পন্ন</span>
        </div>
      </div>

      <h1 className="checkout-title">চেকআউট ও ডেলিভারি বিবরণ</h1>

      {errorMessage && (
        <div className="checkout-error-banner">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="checkout-layout">
        {/* Delivery Form */}
        <div className="checkout-form-col">
          <div className="checkout-card">
            <h3 className="checkout-card-title">
              <Truck size={20} /> প্রাপকের ঠিকানা ও যোগাযোগের তথ্য
            </h3>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">আপনার পূর্ণ নাম *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="যেমন: তানভীর আহমেদ"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">মোবাইল নম্বর (১১ ডিজিট) *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">বিকল্প মোবাইল নম্বর (ঐচ্ছিক)</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="জরুরি যোগাযোগের জন্য"
                  value={altPhone}
                  onChange={(e) => setAltPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">ডেলিভারি এরিয়া / জোন *</label>
                <select
                  className="form-select"
                  value={selectedAreaId}
                  onChange={(e) => handleAreaChange(e.target.value)}
                >
                  {deliveryAreas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.nameBn} — ৳{area.fee} ({area.estimatedHours})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">জেলা *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="যেমন: ঢাকা, রাজশাহী, সিলেট"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">থানা / উপজেলা *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="যেমন: উত্তরা, ধানমন্ডি, বোয়ালিয়া"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">বিস্তারিত ডেলিভারি ঠিকানা (বাসা/রোড/এলাকা) *</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="বাড়ি নং, রোড নং, ফ্ল্যাট বা ল্যান্ডমার্ক বিস্তারিত লিখুন"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">ডেলিভারি সংক্রান্ত বিশেষ নির্দেশনা (ঐচ্ছিক)</label>
              <input
                type="text"
                className="form-input"
                placeholder="যেমন: বিকেল ৫টার পর ডেলিভারি দেবেন"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="checkout-card payment-method-card">
            <h3 className="checkout-card-title">
              <Lock size={20} /> পেমেন্ট পদ্ধতি
            </h3>

            <div className="payment-option selected">
              <input
                type="radio"
                id="cod"
                name="paymentMethod"
                value="cod"
                checked
                readOnly
              />
              <label htmlFor="cod" className="payment-label">
                <div className="payment-title-wrap">
                  <span className="payment-main-text">ক্যাশ অন ডেলিভারি (Cash on Delivery)</span>
                  <span className="badge badge-success">সবচেয়ে জনপ্রিয়</span>
                </div>
                <p className="payment-desc">
                  ডেলিভারিম্যানের কাছ থেকে পণ্য বুঝে পেয়ে চেক করে নগদ মূল্য পরিশোধ করুন। কোনো অগ্রিম পেমেন্টের ঝুঁকি নেই।
                </p>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="checkout-summary-col">
          <div className="checkout-card summary-card">
            <h3 className="checkout-card-title">আপনার অর্ডার ({cart.length})</h3>

            <div className="checkout-items-list">
              {cart.map((item) => {
                const itemPrice = item.product.discountPrice || item.product.price;
                return (
                  <div key={item.product.id} className="checkout-item-row">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.nameBn}
                      className="checkout-item-img"
                    />
                    <div className="checkout-item-details">
                      <span className="checkout-item-name">{item.product.nameBn}</span>
                      <span className="checkout-item-sub">
                        ৳{itemPrice} × {item.quantity} ({item.product.unit})
                      </span>
                    </div>
                    <span className="checkout-item-total">
                      ৳{itemPrice * item.quantity}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-calc-list">
              <div className="calc-row">
                <span>পণ্যের মোট মূল্য (Subtotal)</span>
                <span>৳{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="calc-row discount-row">
                  <span>কুপন ছাড় ({appliedCoupon?.code})</span>
                  <span>-৳{discount}</span>
                </div>
              )}
              <div className="calc-row">
                <span>ডেলিভারি চার্জ</span>
                <span>৳{deliveryFee}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="calc-row grand-total-row">
                <span>সর্বমোট প্রদেয়</span>
                <span className="grand-total-val">৳{total}</span>
              </div>
            </div>

            <div className="checkout-guarantee-note">
              <ShieldCheck size={16} />
              <span>১০০% নিরাপদ শপিং ও ক্যাশ অন ডেলিভারি নিশ্চয়তা</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-confirm-order"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>অর্ডার নিশ্চিত হচ্ছে...</span>
              ) : (
                <>
                  <span>অর্ডার নিশ্চিত করুন (৳{total})</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
