import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, PackageCheck, Truck, CheckCircle2, Clock, AlertCircle, XCircle, ArrowRight, Star, X } from 'lucide-react';
import { orderRepository } from '../../repositories/orderRepository';
import { deliveryRepository } from '../../repositories/deliveryRepository';
import { reviewRepository } from '../../repositories/reviewRepository';
import { useAuth } from '../../context/AuthContext';
import { Order, OrderStatus } from '../../models';
import { LiveOrderTrackingMap } from '../../components/LiveOrderTrackingMap';

export const OrderTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';
  const { currentUser } = useAuth();

  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  // Receipt Confirmation & Rating state
  const [confirming, setConfirming] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [productRating, setProductRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const fetchOrder = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    setCancelMessage(null);
    try {
      const ord = await orderRepository.getById(id.trim());
      if (ord) {
        setSearchedOrder(ord);
      } else {
        setError('প্রদত্ত অর্ডার আইডি দিয়ে কোনো অর্ডার খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক আইডি লিখুন।');
        setSearchedOrder(null);
      }
    } catch (err: any) {
      setError('তথ্য খুঁজতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      fetchOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderIdInput);
  };

  const handleCancelOrder = async () => {
    if (!searchedOrder) return;
    if (window.confirm('আপনি কি নিশ্চিতভাবে এই অর্ডারটি বাতিল করতে চান?')) {
      const res = await orderRepository.cancelOrder(searchedOrder.id, 'গ্রাহক নিজে অর্ডার বাতিল করেছেন।');
      if (res.success) {
        setCancelMessage(res.message);
        fetchOrder(searchedOrder.id);
      } else {
        alert(res.message);
      }
    }
  };

  const handleConfirmReceipt = async () => {
    if (!searchedOrder) return;
    const customerUid = currentUser?.uid || searchedOrder.userId || 'customer-verified';
    if (!window.confirm('আপনি কি নিশ্চিত যে পণ্যগুলো সঠিকভাবে বুঝে পেয়েছেন?')) return;

    setConfirming(true);
    try {
      await deliveryRepository.confirmCustomerReceipt(searchedOrder.id, customerUid);
      await fetchOrder(searchedOrder.id);
      setShowRatingModal(true);
    } catch (err: any) {
      alert(err.message || 'নিশ্চিতকরণ সম্পন্ন করা সম্ভব হয়নি।');
    } finally {
      setConfirming(false);
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchedOrder) return;
    setRatingSubmitting(true);
    const customerUid = currentUser?.uid || searchedOrder.userId || 'customer-verified';
    const customerName = currentUser?.displayName || searchedOrder.deliveryAddress.fullName || 'সম্মানিত গ্রাহক';

    try {
      await deliveryRepository.submitArchiveRating(searchedOrder.id, productRating, deliveryRating, reviewComment);

      if (searchedOrder.items && searchedOrder.items.length > 0) {
        for (const item of searchedOrder.items) {
          await reviewRepository.createReview({
            productId: item.productId,
            productName: item.nameBn,
            userId: customerUid,
            userName: customerName,
            rating: productRating,
            comment: reviewComment || 'পণ্য অত্যন্ত তাজা ও মিষ্টির স্বাদ খুব চমৎকার।'
          });
        }
      }
      setRatingSubmitted(true);
      await fetchOrder(searchedOrder.id);
      setTimeout(() => setShowRatingModal(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setRatingSubmitting(false);
    }
  };

  const getStepStatus = (stepStatus: OrderStatus) => {
    if (!searchedOrder) return 'pending';
    if (searchedOrder.status === 'cancelled') return 'cancelled';

    const orderSteps: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = orderSteps.indexOf(searchedOrder.status);
    const stepIndex = orderSteps.indexOf(stepStatus);

    if (currentIndex >= stepIndex) return 'completed';
    return 'pending';
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem', maxWidth: '850px' }}>
      <div className="breadcrumbs">
        <Link to="/">হোম</Link>
        <span>/</span>
        <span className="current">অর্ডার ট্র্যাকিং</span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          আপনার অর্ডার ট্র্যাক করুন
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
          আপনার অর্ডারের বর্তমান অবস্থা এবং ডেলিভারি আপডেট দেখতে অর্ডার আইডি লিখুন।
        </p>
      </div>

      {/* Search Input Box */}
      <form
        onSubmit={handleSearch}
        style={{
          display: 'flex',
          gap: '0.75rem',
          background: 'var(--color-surface)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-xl)',
          border: '1.5px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '2.5rem'
        }}
      >
        <input
          type="text"
          placeholder="অর্ডার আইডি লিখুন (যেমন: FM-2026-XXXXX)..."
          value={orderIdInput}
          onChange={(e) => setOrderIdInput(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '1.05rem',
            padding: '0.5rem 1rem',
            background: 'transparent'
          }}
          required
        />
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          <Search size={18} />
          <span>{loading ? 'খোঁজা হচ্ছে...' : 'ট্র্যাক করুন'}</span>
        </button>
      </form>

      {error && (
        <div style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {cancelMessage && (
        <div style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <CheckCircle2 size={20} />
          <span>{cancelMessage}</span>
        </div>
      )}

      {/* Searched Order Tracking View */}
      {searchedOrder && (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          {/* Header Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>অর্ডার নম্বর</span>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', margin: 0 }}>
                {searchedOrder.orderNumber}
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block' }}>অর্ডার তারিখ</span>
              <strong>{new Date(searchedOrder.createdAt).toLocaleDateString('bn-BD')}</strong>
            </div>
          </div>

          {/* Stepper Timeline Tracker from reference image 15 */}
          <div style={{ margin: '2rem 0 3rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', textAlign: 'center', position: 'relative' }}>
              {[
                { key: 'pending', title: 'অর্ডার গৃহীত', sub: 'Order Placed' },
                { key: 'processing', title: 'প্রক্রিয়াকরণ', sub: 'Processing' },
                { key: 'shipped', title: 'ডেলিভারির পথে', sub: 'On the Way' },
                { key: 'delivered', title: 'ডেলিভার্ড', sub: 'Delivered' }
              ].map((step, idx) => {
                const status = getStepStatus(step.key as OrderStatus);
                const isCompleted = status === 'completed';
                return (
                  <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: isCompleted ? 'var(--color-primary)' : 'var(--color-surface-subtle)',
                        color: isCompleted ? '#fff' : 'var(--color-text-muted)',
                        border: `2px solid ${isCompleted ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '0.5rem',
                        fontWeight: 700
                      }}
                    >
                      {isCompleted ? <CheckCircle2 size={20} /> : idx + 1}
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isCompleted ? 'var(--color-primary)' : 'var(--color-text)' }}>
                      {step.title}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {step.sub}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {searchedOrder.status === 'cancelled' && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '2rem', fontWeight: 700 }}>
              <XCircle size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              এই অর্ডারটি বাতিল করা হয়েছে।
            </div>
          )}

          {/* Live GPS Tracking Map */}
          {searchedOrder.status !== 'cancelled' && (
            <div style={{ marginBottom: '2rem' }}>
              <LiveOrderTrackingMap
                orderId={searchedOrder.id}
                orderNumber={searchedOrder.orderNumber}
                deliveryStatus={searchedOrder.status}
                assignedRiderName={searchedOrder.assignedDeliveryPersonName || undefined}
                assignedRiderPhone={searchedOrder.assignedDeliveryPersonPhone || undefined}
                customerAddress={`${searchedOrder.deliveryAddress.address}, ${searchedOrder.deliveryAddress.district}`}
              />
            </div>
          )}

          {/* Customer Receipt Confirmation & Rating Action Prompt */}
          {(!['receipt_confirmed', 'delivered', 'cancelled'].includes(searchedOrder.status)) && (
            <div style={{ background: 'var(--color-surface)', border: '2px solid var(--color-primary)', borderRadius: 'var(--radius-xl)', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>📦</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)' }}>
                    পণ্য কি আপনার হাতে পৌঁছেছে?
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    ডেলিভারি রাইডার থেকে পণ্য বুঝে পাওয়ার পর রিসিভ নিশ্চিত করুন ও রেটিং দিন।
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmReceipt}
                disabled={confirming}
                className="btn btn-primary"
                style={{ gap: '0.4rem', fontWeight: 700, background: 'linear-gradient(135deg, #18794E 0%, #105C3A 100%)' }}
              >
                <CheckCircle2 size={16} />
                <span>{confirming ? 'নিশ্চিত হচ্ছে...' : 'পণ্য রিসিভ নিশ্চিত করুন ও রেটিং দিন'}</span>
              </button>
            </div>
          )}

          {/* Receipt Confirmed State */}
          {['receipt_confirmed', 'delivered'].includes(searchedOrder.status) && (
            <div style={{ background: 'rgba(22, 163, 74, 0.1)', border: '1px solid #16a34a', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 size={24} style={{ color: '#16a34a' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#16a34a' }}>
                    পণ্য সফলভাবে রিসিভ ও ডাটাবেজে নিশ্চিত করা হয়েছে
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    এই অর্ডারটি স্থায়ীভাবে আর্কাইভে সংরক্ষিত রয়েছে।
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setShowRatingModal(true)} className="btn btn-primary btn-sm" style={{ gap: '0.4rem' }}>
                <Star size={15} />
                <span>রেটিং ও রিভিউ দিন</span>
              </button>
            </div>
          )}

          {/* Delivery & Items details */}
          <div style={{ background: 'var(--color-surface-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            <h4 style={{ marginBottom: '0.75rem' }}>ডেলিভারি বিবরণ</h4>
            <p style={{ margin: '0 0 0.35rem' }}><strong>প্রাপক:</strong> {searchedOrder.deliveryAddress.fullName} ({searchedOrder.deliveryAddress.phone})</p>
            <p style={{ margin: '0 0 0.35rem' }}><strong>ঠিকানা:</strong> {searchedOrder.deliveryAddress.address}, {searchedOrder.deliveryAddress.district}</p>
            <p style={{ margin: '0' }}><strong>পেমেন্ট পদ্ধতি:</strong> ক্যাশ অন ডেলিভারি (৳{searchedOrder.total})</p>
          </div>

          {/* Action to Cancel if eligible */}
          {(searchedOrder.status === 'pending' || searchedOrder.status === 'processing') && (
            <div style={{ textAlign: 'right' }}>
              <button
                className="btn btn-outline"
                style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                onClick={handleCancelOrder}
              >
                অর্ডার বাতিল করতে চান?
              </button>
            </div>
          )}
        </div>
      )}

      {/* RATING & REVIEW MODAL */}
      {showRatingModal && searchedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--color-surface)', maxWidth: '480px', width: '100%', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                রেটিং ও রিভিউ দিন ⭐
              </h3>
              <button onClick={() => setShowRatingModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {ratingSubmitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-primary)' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>ধন্যবাদ! আপনার রিভিউ সফলভাবে ডাটাবেজে জমা হয়েছে।</h4>
              </div>
            ) : (
              <form onSubmit={handleRatingSubmit}>
                {/* Product Rating */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                    ১. ফল ও মিষ্টির মান (Product Quality)
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setProductRating(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <Star size={28} fill={star <= productRating ? '#f59e0b' : 'none'} color="#f59e0b" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Rating */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                    ২. ডেলিভারি রাইডারের সার্ভিস (Delivery Service)
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setDeliveryRating(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <Star size={28} fill={star <= deliveryRating ? '#f59e0b' : 'none'} color="#f59e0b" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Comment */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                    আপনার মন্তব্য ও মতামত
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="পণ্য ও মিষ্টির স্বাদ কেমন ছিল? আপনার অভিজ্ঞতা লিখুন..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowRatingModal(false)} className="btn btn-outline">
                    পরে দিন
                  </button>
                  <button type="submit" disabled={ratingSubmitting} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #18794E 0%, #105C3A 100%)' }}>
                    {ratingSubmitting ? 'জমা হচ্ছে...' : 'রিভিউ সাবমিট করুন'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
