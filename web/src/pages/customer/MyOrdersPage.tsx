import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Eye, Truck, Clock } from 'lucide-react';
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
        return <span className="badge badge-info">প্রক্রিয়াধীন (Processing)</span>;
      case 'shipped':
        return <span className="badge badge-primary">শিপিং-এ আছে (Shipped)</span>;
      case 'delivered':
        return <span className="badge badge-success">ডেলিভার্ড (Delivered)</span>;
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

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>
        আমার অর্ডারসমূহ
      </h1>

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
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px dashed var(--color-border-subtle)', paddingTop: '0.75rem' }}>
                <Link
                  to={`/order-tracking?orderId=${order.orderNumber}`}
                  className="btn btn-subtle btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  <Truck size={15} /> ট্র্যাক করুন
                </Link>
                <Link
                  to={`/order/${order.id}`}
                  className="btn btn-outline btn-sm"
                  style={{ gap: '0.35rem' }}
                >
                  <Eye size={15} /> বিস্তারিত দেখুন
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
