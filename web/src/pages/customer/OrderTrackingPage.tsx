import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  PackageCheck, Truck, CheckCircle2, Clock, AlertCircle, XCircle,
  ArrowRight, Star, X, Package, Navigation, Eye
} from 'lucide-react';
import { orderRepository } from '../../repositories/orderRepository';
import { deliveryRepository } from '../../repositories/deliveryRepository';
import { reviewRepository } from '../../repositories/reviewRepository';
import { useAuth } from '../../context/AuthContext';
import { Order, OrderStatus } from '../../models';
import { LiveOrderTrackingMap } from '../../components/LiveOrderTrackingMap';

// Active statuses that should be auto-selected first
const ACTIVE_STATUSES: OrderStatus[] = ['out_for_delivery', 'handed_over', 'assigned', 'shipped', 'processing', 'ready_for_dispatch', 'preparing', 'pending'];

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return <span className="badge badge-warning">অপেক্ষমান (Pending)</span>;
    case 'processing':
    case 'preparing':
      return <span className="badge badge-info">প্রস্তুত হচ্ছে (Preparing)</span>;
    case 'ready_for_dispatch':
      return <span className="badge badge-info">প্রেরণে প্রস্তুত</span>;
    case 'assigned':
      return <span className="badge badge-primary">রাইডার অ্যাসাইনকৃত</span>;
    case 'shipped':
    case 'out_for_delivery':
      return <span className="badge badge-primary" style={{ background: '#16a34a', color: '#fff' }}>🚚 ডেলিভারির পথে</span>;
    case 'handed_over':
      return <span className="badge badge-warning" style={{ background: '#fef3c7', color: '#b45309' }}>📦 হস্তান্তরিত (নিশ্চিত করুন)</span>;
    case 'receipt_confirmed':
    case 'delivered':
      return <span className="badge badge-success">✅ সম্পন্ন ও নিশ্চিত</span>;
    case 'delivery_issue':
      return <span className="badge badge-danger">⚠️ সমস্যা তদন্তাধীন</span>;
    case 'cancelled':
      return <span className="badge badge-danger">বাতিল (Cancelled)</span>;
    default:
      return <span className="badge badge-subtle">{status}</span>;
  }
};

export const OrderTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlOrderId = searchParams.get('orderId') || '';
  const { currentUser } = useAuth();

  // Orders list state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Selected order for detailed tracking
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
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

  // Load all user orders on mount
  useEffect(() => {
    async function loadOrders() {
      setOrdersLoading(true);
      try {
        let userOrders: Order[] = [];
        if (currentUser) {
          userOrders = await orderRepository.getByUser(currentUser.uid);
        } else {
          // fallback: local orders
          userOrders = await orderRepository.getByUser('guest');
        }
        setOrders(userOrders);

        // Determine which order to auto-select
        if (urlOrderId) {
          // URL param takes priority
          const fromList = userOrders.find(o => o.id === urlOrderId || o.orderNumber === urlOrderId);
          if (fromList) {
            setSelectedOrder(fromList);
          } else {
            // Try fetching directly
            const ord = await orderRepository.getById(urlOrderId);
            if (ord) setSelectedOrder(ord);
          }
        } else if (userOrders.length > 0) {
          // Auto-select: first active order, otherwise latest order
          const activeOrder = userOrders.find(o => ACTIVE_STATUSES.includes(o.status));
          setSelectedOrder(activeOrder || userOrders[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setOrdersLoading(false);
      }
    }
    loadOrders();
  }, [currentUser, urlOrderId]);

  const refreshSelectedOrder = useCallback(async (orderId: string) => {
    setDetailLoading(true);
    try {
      const ord = await orderRepository.getById(orderId);
      if (ord) {
        setSelectedOrder(ord);
        setOrders(prev => prev.map(o => o.id === ord.id ? ord : o));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setError(null);
    setCancelMessage(null);
    setShowRatingModal(false);
    setRatingSubmitted(false);
    // Scroll to tracking detail
    setTimeout(() => {
      document.getElementById('order-tracking-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    if (window.confirm('আপনি কি নিশ্চিতভাবে এই অর্ডারটি বাতিল করতে চান?')) {
      const res = await orderRepository.cancelOrder(selectedOrder.id, 'গ্রাহক নিজে অর্ডার বাতিল করেছেন।');
      if (res.success) {
        setCancelMessage(res.message);
        await refreshSelectedOrder(selectedOrder.id);
      } else {
        alert(res.message);
      }
    }
  };

  const handleConfirmReceipt = async () => {
    if (!selectedOrder) return;
    const customerUid = currentUser?.uid || selectedOrder.userId || 'customer-verified';
    if (!window.confirm('আপনি কি নিশ্চিত যে পণ্যগুলো সঠিকভাবে বুঝে পেয়েছেন?')) return;

    setConfirming(true);
    try {
      await deliveryRepository.confirmCustomerReceipt(selectedOrder.id, customerUid);
      await refreshSelectedOrder(selectedOrder.id);
      setShowRatingModal(true);
    } catch (err: any) {
      alert(err.message || 'নিশ্চিতকরণ সম্পন্ন করা সম্ভব হয়নি।');
    } finally {
      setConfirming(false);
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setRatingSubmitting(true);
    const customerUid = currentUser?.uid || selectedOrder.userId || 'customer-verified';
    const customerName = currentUser?.displayName || selectedOrder.deliveryAddress.fullName || 'সম্মানিত গ্রাহক';

    try {
      await deliveryRepository.submitArchiveRating(selectedOrder.id, productRating, deliveryRating, reviewComment);

      if (selectedOrder.items && selectedOrder.items.length > 0) {
        for (const item of selectedOrder.items) {
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
      await refreshSelectedOrder(selectedOrder.id);
      setTimeout(() => setShowRatingModal(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setRatingSubmitting(false);
    }
  };

  const getStepStatus = (stepStatus: OrderStatus) => {
    if (!selectedOrder) return 'pending';
    if (selectedOrder.status === 'cancelled') return 'cancelled';

    const orderSteps: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = orderSteps.indexOf(selectedOrder.status);
    const stepIndex = orderSteps.indexOf(stepStatus);

    if (currentIndex >= stepIndex) return 'completed';
    return 'pending';
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem', maxWidth: '960px' }}>
      <div className="breadcrumbs">
        <Link to="/">হোম</Link>
        <span>/</span>
        <span className="current">অর্ডার ট্র্যাকিং ও অর্ডারসমূহ</span>
      </div>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
            আমার অর্ডারসমূহ ও ট্র্যাকিং
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            আপনার অর্ডার নির্বাচন করুন এবং লাইভ ডেলিভারি অবস্থা দেখুন।
          </p>
        </div>
        <Link to="/account/archive" className="btn btn-outline btn-sm" style={{ gap: '0.4rem' }}>
          <span>🏛️ স্থায়ী অর্ডার আর্কাইভ</span>
        </Link>
      </div>

      {/* ── ORDERS LIST ── */}
      {ordersLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '110px', borderRadius: '12px' }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '4rem 2rem',
            textAlign: 'center',
            marginBottom: '2.5rem'
          }}
        >
          <Package size={52} color="var(--color-text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3>আপনার কোনো পূর্ববর্তী অর্ডার নেই</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
            আমাদের তাজা ফল ও মিষ্টির সংগ্রহ থেকে এখনই অর্ডার করুন।
          </p>
          <Link to="/shop" className="btn btn-primary">
            শপিং শুরু করুন
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
          {orders.map((order) => {
            const isSelected = selectedOrder?.id === order.id;
            const isActive = ACTIVE_STATUSES.slice(0, 4).includes(order.status); // shipped/out_for/handed/assigned
            return (
              <div
                key={order.id}
                onClick={() => handleSelectOrder(order)}
                style={{
                  background: 'var(--color-surface)',
                  border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem 1.5rem',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-card)',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block' }}>অর্ডার নম্বর</span>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--color-primary)' }}>{order.orderNumber}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                      {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                    </span>
                    {getStatusBadge(order.status)}
                    {isActive && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
                        লাইভ
                      </span>
                    )}
                  </div>
                </div>

                {/* Items preview */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    {order.items.slice(0, 3).map((item, idx) => (
                      <img
                        key={idx}
                        src={item.imageUrl}
                        alt={item.nameBn}
                        style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                      />
                    ))}
                    {order.items.length > 3 && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>+{order.items.length - 3} টি</span>
                    )}
                    <span style={{ fontSize: '0.88rem', color: 'var(--color-text)', marginLeft: '0.25rem' }}>
                      {order.items.map(i => i.nameBn).join(', ').substring(0, 40)}…
                    </span>
                  </div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--color-text)', whiteSpace: 'nowrap' }}>৳{order.total}</strong>
                </div>

                {/* Action row */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', borderTop: '1px dashed var(--color-border-subtle)', paddingTop: '0.6rem', flexWrap: 'wrap' }}>
                  {isSelected ? (
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                      ▼ ট্র্যাকিং বিবরণ নিচে দেখুন
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleSelectOrder(order); }}
                        className="btn btn-primary btn-sm"
                        style={{ gap: '0.3rem', background: 'linear-gradient(135deg, #18794E 0%, #105C3A 100%)', fontWeight: 700 }}
                      >
                        <Navigation size={13} />
                        <span>লাইভ ট্র্যাকিং</span>
                      </button>
                      {!['receipt_confirmed', 'delivered', 'cancelled'].includes(order.status) && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleSelectOrder(order); }}
                          className="btn btn-outline btn-sm"
                          style={{ gap: '0.3rem', borderColor: '#16a34a', color: '#16a34a', fontWeight: 700 }}
                        >
                          <CheckCircle2 size={13} />
                          <span>পণ্য পেয়েছি?</span>
                        </button>
                      )}
                      <Link
                        to={`/order/${order.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="btn btn-subtle btn-sm"
                        style={{ gap: '0.3rem' }}
                      >
                        <Eye size={13} /> বিস্তারিত
                      </Link>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TRACKING DETAIL PANEL ── */}
      {selectedOrder && (
        <div
          id="order-tracking-detail"
          style={{
            background: 'var(--color-surface)',
            border: '2px solid var(--color-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            boxShadow: 'var(--shadow-card)',
            position: 'relative'
          }}
        >
          {detailLoading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-xl)', zIndex: 5 }}>
              <Clock size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
            </div>
          )}

          {/* Header Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>অর্ডার নম্বর</span>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', margin: 0 }}>
                {selectedOrder.orderNumber}
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block' }}>অর্ডার তারিখ</span>
              <strong>{new Date(selectedOrder.createdAt).toLocaleDateString('bn-BD')}</strong>
            </div>
          </div>

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

          {/* Stepper Timeline Tracker */}
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

          {selectedOrder.status === 'cancelled' && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '2rem', fontWeight: 700 }}>
              <XCircle size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
              এই অর্ডারটি বাতিল করা হয়েছে।
            </div>
          )}

          {/* Live GPS Tracking Map */}
          {selectedOrder.status !== 'cancelled' && (
            <div style={{ marginBottom: '2rem' }}>
              <LiveOrderTrackingMap
                orderId={selectedOrder.id}
                orderNumber={selectedOrder.orderNumber}
                deliveryStatus={selectedOrder.status}
                assignedRiderName={selectedOrder.assignedDeliveryPersonName || undefined}
                assignedRiderPhone={selectedOrder.assignedDeliveryPersonPhone || undefined}
                customerAddress={`${selectedOrder.deliveryAddress.address}, ${selectedOrder.deliveryAddress.district}`}
              />
            </div>
          )}

          {/* Customer Receipt Confirmation & Rating Action Prompt */}
          {(!['receipt_confirmed', 'delivered', 'cancelled'].includes(selectedOrder.status)) && (
            <div style={{ background: 'var(--color-surface)', border: '2px solid var(--color-primary)', borderRadius: 'var(--radius-xl)', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>📦</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)' }}>
                    পণ্য কি আপনার হাতে পৌঁছেছে?
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    ডেলিভারি রাইডার থেকে পণ্য বুঝে পাওয়ার পর রিসিভ নিশ্চিত করুন ও রেটিং দিন।
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
          {['receipt_confirmed', 'delivered'].includes(selectedOrder.status) && (
            <div style={{ background: 'rgba(22, 163, 74, 0.1)', border: '1px solid #16a34a', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 size={24} style={{ color: '#16a34a' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#16a34a' }}>
                    পণ্য সফলভাবে রিসিভ ও ডাটাবেজে নিশ্চিত করা হয়েছে
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    এই অর্ডারটি স্থায়ীভাবে আর্কাইভে সংরক্ষিত রয়েছে।
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
            <p style={{ margin: '0 0 0.35rem' }}><strong>প্রাপক:</strong> {selectedOrder.deliveryAddress.fullName} ({selectedOrder.deliveryAddress.phone})</p>
            <p style={{ margin: '0 0 0.35rem' }}><strong>ঠিকানা:</strong> {selectedOrder.deliveryAddress.address}, {selectedOrder.deliveryAddress.district}</p>
            <p style={{ margin: '0' }}><strong>পেমেন্ট পদ্ধতি:</strong> ক্যাশ অন ডেলিভারি (৳{selectedOrder.total})</p>
          </div>

          {/* Action to Cancel if eligible */}
          {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
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
      {showRatingModal && selectedOrder && (
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
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>ধন্যবাদ! আপনার রিভিউ সফলভাবে ডাটাবেজে জমা হয়েছে।</h4>
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
