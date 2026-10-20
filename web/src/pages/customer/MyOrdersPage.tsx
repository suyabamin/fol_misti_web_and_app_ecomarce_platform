import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Eye, Truck, Clock, Navigation, CheckCircle2, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { orderRepository } from '../../repositories/orderRepository';
import { Order, OrderStatus } from '../../models';

export const MyOrdersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (currentUser) {
        const userOrders = await orderRepository.getByUser(currentUser.uid);
        setOrders(userOrders);
      }
      setLoading(false);
    }
    loadOrders();
  }, [currentUser]);

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

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem', maxWidth: '900px' }}>
      <div className="breadcrumbs">
        <Link to="/">হোম</Link>
        <span>/</span>
        <Link to="/account">আমার একাউন্ট</Link>
        <span>/</span>
        <span className="current">আমার অর্ডারসমূহ</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>
          আমার অর্ডারসমূহ
        </h1>
        <Link to="/account/archive" className="btn btn-outline btn-sm" style={{ gap: '0.4rem' }}>
          <span>🏛️ স্থায়ী অর্ডার আর্কাইভ</span>
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '12px' }}></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '4rem 2rem',
            textAlign: 'center'
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>অর্ডার নম্বর</span>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{order.orderNumber}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                  </span>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Items row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {order.items.slice(0, 3).map((item, idx) => (
                    <img
                      key={idx}
                      src={item.imageUrl}
                      alt={item.nameBn}
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                    />
                  ))}
                  {order.items.length > 3 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      +{order.items.length - 3} টি পণ্য
                    </span>
                  )}
                  <div style={{ marginLeft: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>
                      {order.items.map(i => i.nameBn).join(', ').substring(0, 45)}...
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block' }}>সর্বমোট প্রদেয়</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--color-text)' }}>৳{order.total}</strong>
                </div>
              </div>

              {/* Actions row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px dashed var(--color-border-subtle)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {(order.status === 'out_for_delivery' || order.status === 'handed_over' || order.status === 'assigned') && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', animation: 'pulse 1.5s infinite' }} />
                      লাইভ ট্র্যাকিং সক্রিয়
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {/* 1-Click Track Button */}
                  <Link
                    to={`/order/${order.id}?track=true`}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '0.35rem', background: 'linear-gradient(135deg, #18794E 0%, #105C3A 100%)', fontWeight: 700 }}
                  >
                    <Navigation size={14} />
                    <span>১-ক্লিকে লাইভ ট্র্যাকিং</span>
                  </Link>

                  {/* 1-Click Confirm Receipt if delivered or in transit */}
                  {(!['receipt_confirmed', 'delivered', 'cancelled'].includes(order.status)) && (
                    <Link
                      to={`/order/${order.id}`}
                      className="btn btn-outline btn-sm"
                      style={{ gap: '0.35rem', borderColor: '#16a34a', color: '#16a34a', fontWeight: 700 }}
                    >
                      <CheckCircle2 size={14} />
                      <span>পণ্য পেয়েছি? নিশ্চিত করুন</span>
                    </Link>
                  )}

                  <Link
                    to={`/order/${order.id}`}
                    className="btn btn-subtle btn-sm"
                    style={{ gap: '0.35rem' }}
                  >
                    <Eye size={14} /> বিস্তারিত
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
