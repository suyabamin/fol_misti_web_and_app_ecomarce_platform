import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Archive, PackageCheck, Star, Clock, CheckCircle2, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deliveryRepository } from '../../repositories/deliveryRepository';
import { OrderArchive } from '../../models';

export const ArchivedOrdersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [archives, setArchives] = useState<OrderArchive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.uid) {
      loadArchives(currentUser.uid);
    }
  }, [currentUser?.uid]);

  const loadArchives = async (uid: string) => {
    setLoading(true);
    try {
      const list = await deliveryRepository.getCustomerArchives(uid);
      setArchives(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem', maxWidth: '850px' }}>
      <div className="breadcrumbs">
        <Link to="/">হোম</Link>
        <span>/</span>
        <Link to="/account">আমার প্রোফাইল</Link>
        <span>/</span>
        <span className="current">অর্ডার আর্কাইভ</span>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
          স্থায়ী অর্ডার আর্কাইভ (Completed Order Archive) 🏛️
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          আপনার সফলভাবে গ্রহণকৃত ও নিশ্চিতকৃত পূর্ববর্তী অর্ডারের স্থায়ী ডিজিটাল রেকর্ড ও রশিদ
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
          আর্কাইভ লোড হচ্ছে...
        </div>
      ) : archives.length === 0 ? (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '3.5rem',
            textAlign: 'center'
          }}
        >
          <Archive size={52} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            এখনো কোনো আর্কাইভকৃত অর্ডার নেই
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            আপনি যখন পণ্য হাতে পেয়ে "রিসিভ কনফার্মেশন" করবেন, তখন অর্ডারটি স্বয়ংক্রিয়ভাবে এখানে স্থায়ী আর্কাইভে যুক্ত হবে।
          </p>
          <Link to="/my-orders" className="btn btn-primary">
            চলমান অর্ডারসমূহ দেখুন
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {archives.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {/* Archive Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                      অর্ডার #{item.orderNumber}
                    </span>
                    <span style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle2 size={12} />
                      <span>স্থায়ীভাবে সংরক্ষিত</span>
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                    <Clock size={13} />
                    <span>অর্ডারের তারিখ: {new Date(item.orderDate).toLocaleDateString('bn-BD')}</span>
                    <span>•</span>
                    <span>রিসিভ নিশ্চিতকরণ: {new Date(item.receiptConfirmedTimestamp).toLocaleDateString('bn-BD')}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)' }}>
                    ৳{item.total}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>
                    পরিশোধিত (ক্যাশ অন ডেলিভারি)
                  </div>
                </div>
              </div>

              {/* Items Snapshot */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                  পণ্য তালিকা (Historical Snapshot):
                </div>
                <div style={{ background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {item.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {it.imageUrl && (
                          <img
                            src={it.imageUrl}
                            alt=""
                            style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                          />
                        )}
                        <span>{it.nameBn || it.name} &times; {it.quantity} {it.unit}</span>
                      </div>
                      <span style={{ fontWeight: 700 }}>৳{it.total}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Details & Rating */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--color-border)', fontSize: '0.85rem' }}>
                <div style={{ color: 'var(--color-text-muted)' }}>
                  ডেলিভারি রাইডার: <strong>{item.deliveryPersonName}</strong>
                </div>

                <div>
                  {item.isRated ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f59e0b', fontWeight: 700 }}>
                      <Star size={16} fill="#f59e0b" />
                      <span>রেটিং প্রদান করা হয়েছে</span>
                    </div>
                  ) : (
                    <Link to={`/order/${item.orderId}`} className="btn btn-outline btn-sm" style={{ gap: '0.35rem' }}>
                      <Star size={14} />
                      <span>রেটিং ও রিভিউ দিন</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
