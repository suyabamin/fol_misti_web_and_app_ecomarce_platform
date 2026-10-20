import React, { useEffect, useState } from 'react';
import { PackageCheck, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { orderRepository } from '../../repositories/orderRepository';
import { Order } from '../../models';

export const DeliveryHistoryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [currentUser?.uid]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const allOrders: Order[] = await orderRepository.getOrders();
      const completed = allOrders.filter(
        (o: Order) =>
          (o.assignedDeliveryPersonId === currentUser?.uid ||
           o.assignedDeliveryPersonId === 'delivery-agent-1') &&
          (o.status === 'receipt_confirmed' || o.status === 'delivered')
      );
      setCompletedOrders(completed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
          সম্পন্ন ডেলিভারি হিস্ট্রি 📦
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          আপনার সফলভাবে সম্পন্ন করা পূর্ববর্তী সকল ডেলিভারির বিবরণ
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          হিস্ট্রি লোড হচ্ছে...
        </div>
      ) : completedOrders.length === 0 ? (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--color-text-secondary)'
          }}
        >
          <PackageCheck size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            এখনো কোনো ডেলিভারি সম্পন্ন হয়নি
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            অ্যাসাইনকৃত অর্ডার সফলভাবে গ্রাহকের কাছে হস্তান্তর ও নিশ্চিতকরণের পর এখানে প্রদর্শিত হবে।
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {completedOrders.map((order) => (
            <div
              key={order.id}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-text)' }}>
                    অর্ডার #{order.orderNumber}
                  </span>
                  <span
                    style={{
                      background: 'rgba(22, 163, 74, 0.1)',
                      color: '#16a34a',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <CheckCircle2 size={12} />
                    <span>গ্রাহক কর্তৃক গৃহীত</span>
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  গ্রাহক: <strong>{order.deliveryAddress.fullName}</strong> ({order.deliveryAddress.phone})
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                  <MapPin size={13} />
                  <span>{order.deliveryAddress.address}, {order.deliveryAddress.city}</span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                  <Clock size={12} />
                  <span>নিশ্চিতকরণ: {order.receiptConfirmedAt ? new Date(order.receiptConfirmedAt).toLocaleString('bn-BD') : 'সম্পন্ন'}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  অর্জিত ডেলিভারি ফি:
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>
                  +৳{order.deliveryFee || 60}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  ক্যাশ কালেকশন: ৳{order.total}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
