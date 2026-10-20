import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Printer,
  AlertTriangle,
  Star,
  MessageSquare,
  Navigation,
  Check,
  X
} from 'lucide-react';
import { orderRepository } from '../../repositories/orderRepository';
import { deliveryRepository } from '../../repositories/deliveryRepository';
import { reviewRepository } from '../../repositories/reviewRepository';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../models';
import { LiveOrderTrackingMap } from '../../components/LiveOrderTrackingMap';

export const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { currentUser } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  // Receipt Confirmation & Rating state
  const [confirming, setConfirming] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [productRating, setProductRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Delivery Issue Reporting state
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueType, setIssueType] = useState<'damaged_product' | 'missing_item' | 'wrong_order' | 'not_delivered' | 'delayed' | 'other'>('damaged_product');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueSubmitting, setIssueSubmitting] = useState(false);
  const [issueSuccess, setIssueSuccess] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const ord = await orderRepository.getById(orderId);
      setOrder(ord);
      // Auto-open live map if out for delivery
      if (ord?.status === 'out_for_delivery') {
        setShowMap(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!order || !currentUser?.uid) return;
    if (!window.confirm('আপনি কি নিশ্চিত যে আপনি পণ্যগুলো সঠিকভাবে বুঝে পেয়েছেন?')) return;

    setConfirming(true);
    try {
      await deliveryRepository.confirmCustomerReceipt(order.id, currentUser.uid);
      await loadOrder();
      setShowRatingModal(true);
    } catch (err: any) {
      alert(err.message || 'নিশ্চিতকরণ সম্পন্ন করা সম্ভব হয়নি।');
    } finally {
      setConfirming(false);
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setRatingSubmitting(true);
    try {
      await deliveryRepository.submitArchiveRating(order.id, productRating, deliveryRating, reviewComment);
      // Also register review in public review collection for first item
      if (order.items[0]?.productId) {
        await reviewRepository.createReview({
          productId: order.items[0].productId,
          productName: order.items[0].nameBn,
          userId: currentUser?.uid || 'guest',
          userName: currentUser?.displayName || 'গ্রাহক',
          rating: productRating,
          comment: reviewComment || 'পণ্য ও মিষ্টির স্বাদ অত্যন্ত চমৎকার।'
        });
      }
      setRatingSubmitted(true);
      setTimeout(() => setShowRatingModal(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !currentUser?.uid) return;
    setIssueSubmitting(true);
    try {
      await deliveryRepository.reportDeliveryIssue(
        order.id,
        currentUser.uid,
        order.deliveryAddress.fullName,
        order.deliveryAddress.phone,
        issueType,
        issueDescription
      );
      setIssueSuccess(true);
      await loadOrder();
      setTimeout(() => setShowIssueModal(false), 3000);
    } catch (err: any) {
      alert(err.message || 'রিপোর্ট করা সম্ভব হয়নি।');
    } finally {
      setIssueSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <div className="skeleton" style={{ height: '350px' }}></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>অর্ডারটি পাওয়া যায়নি</h2>
        <Link to="/my-orders" className="btn btn-primary mt-2">অর্ডার তালিকায় ফিরুন</Link>
      </div>
    );
  }

  const isHandedOver = order.status === 'handed_over';
  const isReceiptConfirmed = order.status === 'receipt_confirmed' || order.status === 'delivered';
  const isOutForDelivery = order.status === 'out_for_delivery';
  const hasDeliveryAssigned = Boolean(order.assignedDeliveryPersonId);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem', maxWidth: '850px' }}>
      <div className="breadcrumbs">
        <Link to="/">হোম</Link>
        <span>/</span>
        <Link to="/my-orders">আমার অর্ডারসমূহ</Link>
        <span>/</span>
        <span className="current">{order.orderNumber}</span>
      </div>

      {/* Header with Title and Tracking Shortcuts */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>অর্ডার বিস্তারিত</span>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', margin: 0 }}>
            {order.orderNumber}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => window.print()} className="btn btn-subtle btn-sm">
            <Printer size={16} /> প্রিন্ট ইনভয়েস
          </button>

          {/* 1-Click Track My Order Button */}
          <button
            onClick={() => setShowMap(!showMap)}
            className={`btn ${showMap ? 'btn-outline' : 'btn-primary'} btn-sm`}
            style={{ gap: '0.4rem' }}
          >
            <Navigation size={16} />
            <span>{showMap ? 'ম্যাপ বন্ধ করুন' : 'অর্ডার ট্র্যাক করুন (Live Map)'}</span>
          </button>
        </div>
      </div>

      {/* Live Map Display Section */}
      {showMap && (
        <div style={{ marginBottom: '2rem' }}>
          <LiveOrderTrackingMap
            orderId={order.id}
            orderNumber={order.orderNumber}
            deliveryStatus={order.status}
            assignedRiderName={order.assignedDeliveryPersonName || 'ডেলিভারি রাইডার'}
            assignedRiderPhone={order.assignedDeliveryPersonPhone || ''}
            customerAddress={`${order.deliveryAddress.address}, ${order.deliveryAddress.city}`}
          />
        </div>
      )}

      {/* CRITICAL: Handover Notification & Customer Receipt Confirmation Actions */}
      {isHandedOver && (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '2px solid var(--color-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <span style={{ fontSize: '2.5rem' }}>📦</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
                পণ্য হস্তান্তর সম্পন্ন হয়েছে!
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                ডেলিভারি রাইডার পণ্যটি আপনার ঠিকানায় হস্তান্তর করেছেন। আপনি কি আপনার অর্ডারের সকল ফল ও মিষ্টি সঠিকভাবে বুঝে পেয়েছেন?
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary btn-md"
                  disabled={confirming}
                  onClick={handleConfirmReceipt}
                  style={{ gap: '0.5rem', fontWeight: 700 }}
                >
                  <CheckCircle2 size={18} />
                  <span>{confirming ? 'নিশ্চিত হচ্ছে...' : 'হ্যাঁ, আমি পণ্য গ্রহণ করেছি (Confirm Receipt)'}</span>
                </button>
                <button
                  className="btn btn-outline btn-md"
                  onClick={() => setShowIssueModal(true)}
                  style={{ gap: '0.5rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                >
                  <AlertTriangle size={18} />
                  <span>সমস্যা রিপোর্ট করুন (Report a Problem)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Confirmed & Permanent Archive Badge */}
      {isReceiptConfirmed && (
        <div
          style={{
            background: 'rgba(22, 163, 74, 0.1)',
            border: '1px solid #16a34a',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={24} style={{ color: '#16a34a' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#16a34a' }}>
                পণ্য গ্রহণের বিষয়টি গ্রাহক কর্তৃক নিশ্চিত করা হয়েছে
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                অর্ডারটি আপনার স্থায়ী আর্কাইভে সংরক্ষিত রয়েছে।
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowRatingModal(true)}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <Star size={16} />
            <span>রেটিং ও রিভিউ দিন</span>
          </button>
        </div>
      )}

      {/* Order Dispute / Issue Warning if reported */}
      {order.status === 'delivery_issue' && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--color-danger)', marginBottom: '0.25rem' }}>
            <AlertTriangle size={20} />
            <span>ডেলিভারি সমস্যা তদন্তাধীন</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            আপনার রিপোর্টটি আমাদের কাস্টমার সাপোর্ট টিম পর্যালোচনা করছে। প্রয়োজনে লাইভ চ্যাটের মাধ্যমে যোগাযোগ করুন।
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.75rem' }}>
        {/* Recipient & Payment info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.5rem' }}>
              ডেলিভারি ঠিকানা
            </h4>
            <p style={{ margin: '0 0 0.35rem', fontWeight: 700 }}>{order.deliveryAddress.fullName}</p>
            <p style={{ margin: '0 0 0.35rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              {order.deliveryAddress.address}, {order.deliveryAddress.city}, {order.deliveryAddress.district}
            </p>
            <p style={{ margin: '0', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              মোবাইল: {order.deliveryAddress.phone}
            </p>
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.5rem' }}>
              পেমেন্ট তথ্য
            </h4>
            <p style={{ margin: '0 0 0.35rem' }}>
              <strong>পদ্ধতি:</strong> ক্যাশ অন ডেলিভারি (COD)
            </p>
            <p style={{ margin: '0 0 0.35rem' }}>
              <strong>পেমেন্ট স্ট্যাটাস:</strong>{' '}
              <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                {order.paymentStatus === 'paid' ? 'পরিশোধিত' : 'বকেয়া (ডেলিভারিতে প্রদেয়)'}
              </span>
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              তারিখ: {new Date(order.createdAt).toLocaleString('bn-BD')}
            </p>
          </div>
        </div>

        {/* Items List */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>অর্ডারকৃত পণ্য তালিকা</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={item.imageUrl}
                    alt={item.nameBn}
                    style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                  />
                  <div>
                    <strong style={{ fontSize: '0.95rem', display: 'block' }}>{item.nameBn}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      ৳{item.price} × {item.quantity} ({item.unit})
                    </span>
                  </div>
                </div>
                <strong style={{ fontSize: '1.05rem', color: 'var(--color-primary)' }}>
                  ৳{item.total}
                </strong>
              </div>
            ))}
          </div>

          {/* Pricing Calculation Breakdown */}
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '320px', marginLeft: 'auto', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
              <span>সাবটোটাল</span>
              <span>৳{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)', fontWeight: 600 }}>
                <span>কুপন ছাড়</span>
                <span>-৳{order.discount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
              <span>ডেলিভারি চার্জ</span>
              <span>৳{order.deliveryFee}</span>
            </div>
            <div style={{ height: '1px', background: 'var(--color-border)', margin: '0.5rem 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800 }}>
              <span>সর্বমোট প্রদেয়</span>
              <span style={{ color: 'var(--color-primary)' }}>৳{order.total}</span>
            </div>
          </div>
        </div>

        {/* Status History Timeline */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>স্ট্যাটাস ইতিহাস</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {order.statusHistory.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-primary)', marginTop: '6px' }}></div>
                <div>
                  <strong style={{ fontSize: '0.95rem', display: 'block' }}>{h.note}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {new Date(h.timestamp).toLocaleString('bn-BD')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RATING & REVIEW MODAL */}
      {showRatingModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--color-surface)', maxWidth: '480px', width: '100%', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>আপনার অভিজ্ঞতা রেটিং করুন ⭐</h3>
              <button onClick={() => setShowRatingModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {ratingSubmitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-primary)' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>ধন্যবাদ! আপনার মূল্যবান রিভিউ জমা হয়েছে।</h4>
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
                    আপনার মন্তব্য
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="পণ্য ও সার্ভিসের বিষয়ে আপনার মতামত লিখুন..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowRatingModal(false)} className="btn btn-outline">
                    পরে দিন
                  </button>
                  <button type="submit" disabled={ratingSubmitting} className="btn btn-primary">
                    {ratingSubmitting ? 'জমা হচ্ছে...' : 'রিভিউ সাবমিট করুন'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* REPORT ISSUE MODAL */}
      {showIssueModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--color-surface)', maxWidth: '480px', width: '100%', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--color-danger)' }}>
                ডেলিভারি সমস্যা রিপোর্ট করুন ⚠️
              </h3>
              <button onClick={() => setShowIssueModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {issueSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-primary)' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>আপনার অভিযোগটি সফলভাবে গৃহীত হয়েছে।</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                  আমাদের কাস্টমার কেয়ার প্রতিনিধি অবিলম্বে আপনার সাথে যোগাযোগ করবেন।
                </p>
              </div>
            ) : (
              <form onSubmit={handleIssueSubmit}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                    সমস্যার ধরন নির্বাচন করুন
                  </label>
                  <select
                    className="form-select"
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value as any)}
                  >
                    <option value="damaged_product">পণ্য ক্ষতিগ্রস্ত বা নষ্ট (Damaged)</option>
                    <option value="missing_item">কোনো পণ্য কম বা মিসিং (Missing Item)</option>
                    <option value="wrong_order">ভুল পণ্য ডেলিভারি হয়েছে (Wrong Order)</option>
                    <option value="not_delivered">পণ্য হাতে পাইনি কিন্তু ডেলিভার্ড দেখাচ্ছে</option>
                    <option value="delayed">অতিরিক্ত দেরি হচ্ছে</option>
                    <option value="other">অন্যান্য সমস্যা</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                    সমস্যার বিস্তারিত বিবরণ
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="অনুগ্রহ করে সমস্যাটির বিবরণ দিন..."
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowIssueModal(false)} className="btn btn-outline">
                    বাতিল
                  </button>
                  <button type="submit" disabled={issueSubmitting} className="btn btn-primary" style={{ background: 'var(--color-danger)' }}>
                    {issueSubmitting ? 'জমা হচ্ছে...' : 'অভিযোগ জমা দিন'}
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
