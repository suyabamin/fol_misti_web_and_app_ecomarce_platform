import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, PackageCheck, Truck, CheckCircle2, Clock, AlertCircle, XCircle, ArrowRight } from 'lucide-react';
import { orderRepository } from '../../repositories/orderRepository';
import { Order, OrderStatus } from '../../models';
import { LiveOrderTrackingMap } from '../../components/LiveOrderTrackingMap';

export const OrderTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

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

          {/* Handover Notice link */}
          {searchedOrder.status === 'handed_over' && (
            <div style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <strong style={{ color: 'var(--color-primary)', fontSize: '1rem', display: 'block' }}>
                  পণ্য হস্তান্তর সম্পন্ন হয়েছে!
                </strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  অনুগ্রহ করে পণ্য বুঝে নিয়ে নিশ্চিতকরণ করুন।
                </span>
              </div>
              <Link to={`/order/${searchedOrder.id}`} className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
                <span>রিসিভ নিশ্চিত করুন</span>
                <ArrowRight size={14} />
              </Link>
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
    </div>
  );
};
