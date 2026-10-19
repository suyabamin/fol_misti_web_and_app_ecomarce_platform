import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Truck, CheckCircle2, ArrowLeft, Printer, AlertTriangle } from 'lucide-react';
import { orderRepository } from '../../repositories/orderRepository';
import { Order } from '../../models';

export const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      try {
        const ord = await orderRepository.getById(orderId);
        setOrder(ord);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

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

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem', maxWidth: '850px' }}>
      <div className="breadcrumbs">
        <Link to="/">হোম</Link>
        <span>/</span>
        <Link to="/my-orders">আমার অর্ডারসমূহ</Link>
        <span>/</span>
        <span className="current">{order.orderNumber}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>অর্ডার বিস্তারিত</span>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', margin: 0 }}>{order.orderNumber}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => window.print()} className="btn btn-subtle btn-sm">
            <Printer size={16} /> প্রিন্ট ইনভয়েস
          </button>
          <Link to={`/order-tracking?orderId=${order.orderNumber}`} className="btn btn-primary btn-sm">
            <Truck size={16} /> লাইভ ট্র্যাকিং
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.75rem' }}>
        {/* Recipient & Payment info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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
    </div>
  );
};
