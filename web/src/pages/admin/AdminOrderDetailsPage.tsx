import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, Truck, XCircle, Printer, Save, AlertCircle } from 'lucide-react';
import { orderRepository } from '../../repositories/orderRepository';
import { Order, OrderStatus } from '../../models';

export const AdminOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('pending');
  const [statusNote, setStatusNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadOrder = async () => {
    if (!id) return;
    const ord = await orderRepository.getById(id);
    if (ord) {
      setOrder(ord);
      setSelectedStatus(ord.status);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setSaving(true);
    if (selectedStatus === 'cancelled' && order.status !== 'cancelled') {
      await orderRepository.cancelOrder(order.id, statusNote || 'অ্যাডমিন কর্তৃক অর্ডার বাতিল করা হয়েছে।');
    } else {
      await orderRepository.updateStatus(order.id, selectedStatus, statusNote);
    }
    await loadOrder();
    setSaving(false);
    setSaveSuccess(true);
    setStatusNote('');
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (!order) {
    return (
      <div>
        <p>অর্ডার লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link to="/admin/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> সকল অর্ডারে ফিরুন
          </Link>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
            অর্ডার নং: {order.orderNumber}
          </h1>
        </div>

        <button onClick={() => window.print()} className="btn btn-subtle btn-sm">
          <Printer size={16} /> চালান প্রিন্ট করুন
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Col: Items & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Items card */}
          <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>অর্ডারকৃত পণ্যসমূহ</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img
                      src={item.imageUrl}
                      alt={item.nameBn}
                      style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.95rem', display: 'block' }}>{item.nameBn}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        ৳{item.price} × {item.quantity} ({item.unit})
                      </span>
                    </div>
                  </div>
                  <strong style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>৳{item.total}</strong>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '300px', marginLeft: 'auto', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>সাবটোটাল:</span>
                <span>৳{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)', fontWeight: 600 }}>
                  <span>কুপন ছাড়:</span>
                  <span>-৳{order.discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>ডেলিভারি চার্জ:</span>
                <span>৳{order.deliveryFee}</span>
              </div>
              <div style={{ height: '1px', background: 'var(--color-border)', margin: '0.35rem 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800 }}>
                <span>সর্বমোট:</span>
                <span style={{ color: 'var(--color-primary)' }}>৳{order.total}</span>
              </div>
            </div>
          </div>

          {/* Customer info card */}
          <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>গ্রাহক ও ডেলিভারি বিবরণ</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>নাম:</span>
                <strong>{order.deliveryAddress.fullName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>মোবাইল নম্বর:</span>
                <strong>{order.deliveryAddress.phone}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>বিকল্প নম্বর:</span>
                <span>{order.deliveryAddress.alternativePhone || 'দেওয়া হয়নি'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>জেলা ও শহর:</span>
                <strong>{order.deliveryAddress.city}, {order.deliveryAddress.district}</strong>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>বিস্তারিত ঠিকানা:</span>
                <span>{order.deliveryAddress.address}</span>
              </div>
              {order.deliveryAddress.deliveryNotes && (
                <div style={{ gridColumn: 'span 2', background: 'var(--color-surface-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>বিশেষ নির্দেশনা:</span>
                  <span>{order.deliveryAddress.deliveryNotes}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Update Status Form from reference A6 */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>অর্ডার স্ট্যাটাস আপডেট</h3>

          {saveSuccess && (
            <div style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
              <CheckCircle2 size={16} /> স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!
            </div>
          )}

          <form onSubmit={handleUpdateStatus}>
            <div className="form-group">
              <label className="form-label">বর্তমান অবস্থা নির্বাচন করুন</label>
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
              >
                <option value="pending">অপেক্ষমান (Pending)</option>
                <option value="processing">প্রক্রিয়াধীন (Processing)</option>
                <option value="shipped">শিপিং বা ডেলিভারির পথে (Shipped)</option>
                <option value="delivered">সফলভাবে ডেলিভার্ড (Delivered)</option>
                <option value="cancelled">বাতিল (Cancelled)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">আপডেট সংক্রান্ত নোট (ঐচ্ছিক)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="যেমন: প্যাকেজিং সম্পন্ন করে রাইডারের কাছে হস্তান্তর করা হয়েছে।"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '0.4rem' }} disabled={saving}>
              <Save size={16} />
              <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'স্ট্যাটাস আপডেট করুন'}</span>
            </button>
          </form>

          {/* Status Timeline History */}
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>ইতিহাস টাইমলাইন</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {order.statusHistory.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.85rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)', marginTop: '5px' }}></div>
                  <div>
                    <span style={{ fontWeight: 600, display: 'block' }}>{h.note}</span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                      {new Date(h.timestamp).toLocaleString('bn-BD')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
