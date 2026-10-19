import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, PackageCheck, MapPin, Phone, CreditCard, ArrowRight, Home } from 'lucide-react';
import { orderRepository } from '../../repositories/orderRepository';
import { Order } from '../../models';

export const OrderSuccessPage: React.FC = () => {
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

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', maxWidth: '750px' }}>
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center'
        }}
      >
        {/* Large green check circle from reference image 08 */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--color-success-light)',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}
        >
          <CheckCircle2 size={48} />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
          অর্ডার সফলভাবে সম্পন্ন হয়েছে!
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', marginBottom: '2rem' }}>
          ফল মিষ্টিতে অর্ডার করার জন্য ধন্যবাদ। আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।
        </p>

        {/* Order Details Card */}
        {order && (
          <div
            style={{
              background: 'var(--color-surface-subtle)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              textAlign: 'left',
              marginBottom: '2rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>অর্ডার নম্বর</span>
                <strong style={{ fontSize: '1.15rem', color: 'var(--color-primary)' }}>{order.orderNumber}</strong>
              </div>
              <div>
                <span className="badge badge-success">অর্ডার গৃহীত (Pending)</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>প্রাপক: </span>
                <strong>{order.deliveryAddress.fullName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>মোবাইল: </span>
                <strong>{order.deliveryAddress.phone}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>পেমেন্ট পদ্ধতি: </span>
                <strong>ক্যাশ অন ডেলিভারি (COD)</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>সর্বমোট মূল্য: </span>
                <strong style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>৳{order.total}</strong>
              </div>
            </div>

            <div style={{ fontSize: '0.9rem', borderTop: '1px dashed var(--color-border)', paddingTop: '0.75rem' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>ডেলিভারি ঠিকানা: </span>
              <span>{order.deliveryAddress.address}, {order.deliveryAddress.city}, {order.deliveryAddress.district}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to={`/order-tracking?orderId=${order?.orderNumber || orderId}`}
            className="btn btn-primary btn-lg"
          >
            <span>অর্ডার ট্র্যাক করুন</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/" className="btn btn-subtle btn-lg">
            <Home size={18} />
            <span>হোমপেজে ফিরে যান</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
