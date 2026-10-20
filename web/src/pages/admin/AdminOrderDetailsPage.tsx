import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Printer,
  Save,
  AlertCircle,
  UserCheck,
  Navigation,
  X
} from 'lucide-react';
import { orderRepository } from '../../repositories/orderRepository';
import { deliveryRepository } from '../../repositories/deliveryRepository';
import { Order, OrderStatus, DeliveryProfile } from '../../models';
import { LiveOrderTrackingMap } from '../../components/LiveOrderTrackingMap';

export const AdminOrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('pending');
  const [statusNote, setStatusNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Delivery Assignment state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [riders, setRiders] = useState<DeliveryProfile[]>([]);
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [showAdminMap, setShowAdminMap] = useState(false);

  const loadOrder = async () => {
    if (!id) return;
    const ord = await orderRepository.getById(id);
    if (ord) {
      setOrder(ord);
      setSelectedStatus(ord.status);
    }
  };

  const loadRiders = async () => {
    try {
      const list = await deliveryRepository.getDeliveryProfiles();
      setRiders(list);
      if (list.length > 0 && !selectedRiderId) {
        setSelectedRiderId(list[0].uid);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadOrder();
    loadRiders();
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

  const handleAssignRider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setAssignError(null);

    const rider = riders.find(r => r.uid === selectedRiderId || r.id === selectedRiderId);
    if (!rider) {
      setAssignError('রাইডার নির্বাচন করুন।');
      return;
    }

    if (rider.status !== 'active') {
      setAssignError('নির্বাচিত রাইডার বর্তমানে স্থগিত (Suspended)।');
      return;
    }

    if (rider.availability === 'unavailable') {
      setAssignError('নির্বাচিত রাইডার বর্তমানে অফলাইন বা ছুটিতে আছেন।');
      return;
    }

    const maxDeliveries = rider.schedule?.maxActiveDeliveries || 2;
    if ((rider.currentActiveDeliveries || 0) >= maxDeliveries) {
      setAssignError(`এই রাইডারের সর্বোচ্চ সক্রিয় ডেলিভারি সীমা (${maxDeliveries} টি) পূর্ণ হয়েছে।`);
      return;
    }

    const isReassign = Boolean(order.assignedDeliveryPersonId && order.assignedDeliveryPersonId !== selectedRiderId);
    if (isReassign && !reassignReason.trim()) {
      setAssignError('পুনঃঅ্যাসাইন (Reassign) করার কারণ উল্লেখ করা আবশ্যক।');
      return;
    }

    setAssigning(true);
    try {
      await deliveryRepository.assignDeliveryPerson(order.id, selectedRiderId, reassignReason, 'admin');
      await loadOrder();
      await loadRiders();
      setShowAssignModal(false);
      setReassignReason('');
    } catch (err: any) {
      setAssignError(err.message || 'অ্যাসাইন সম্পন্ন করা যায়নি।');
    } finally {
      setAssigning(false);
    }
  };

  if (!order) {
    return (
      <div>
        <p>অর্ডার লোড হচ্ছে...</p>
      </div>
    );
  }

  const currentRider = riders.find(r => r.uid === selectedRiderId || r.id === selectedRiderId);

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link to="/admin/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> সকল অর্ডারে ফিরুন
          </Link>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
            অর্ডার নং: {order.orderNumber}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setShowAdminMap(!showAdminMap)} className={`btn ${showAdminMap ? 'btn-outline' : 'btn-primary'} btn-sm`} style={{ gap: '0.4rem' }}>
            <Navigation size={16} />
            <span>{showAdminMap ? 'ম্যাপ বন্ধ' : 'লাইভ ট্র্যাকিং ম্যাপ'}</span>
          </button>
          <button onClick={() => window.print()} className="btn btn-subtle btn-sm">
            <Printer size={16} /> চালান প্রিন্ট করুন
          </button>
        </div>
      </div>

      {/* Admin Live Tracking Map View */}
      {showAdminMap && (
        <div style={{ marginBottom: '2rem' }}>
          <LiveOrderTrackingMap
            orderId={order.id}
            orderNumber={order.orderNumber}
            deliveryStatus={order.status}
            assignedRiderName={order.assignedDeliveryPersonName || undefined}
            assignedRiderPhone={order.assignedDeliveryPersonPhone || undefined}
            customerAddress={`${order.deliveryAddress.address}, ${order.deliveryAddress.city}`}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Left Col: Items & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Delivery Rider Assignment Card */}
          <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={18} style={{ color: 'var(--color-primary)' }} />
                <span>ডেলিভারি রাইডার তথ্য</span>
              </h3>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => { setShowAssignModal(true); setAssignError(null); }}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                {order.assignedDeliveryPersonId ? 'রাইডার পরিবর্তন (Reassign)' : 'রাইডার অ্যাসাইন করুন'}
              </button>
            </div>

            {order.assignedDeliveryPersonId ? (
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                  {order.assignedDeliveryPersonName || 'অ্যাসাইনকৃত রাইডার'}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                  ফোন: <strong>{order.assignedDeliveryPersonPhone || 'N/A'}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  অ্যাসাইনের সময়: {order.deliveryAssignedAt ? new Date(order.deliveryAssignedAt).toLocaleString('bn-BD') : 'তথ্য নেই'}
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                এই অর্ডারে এখনও কোনো ডেলিভারি রাইডার নিয়োগ দেওয়া হয়নি।
              </div>
            )}
          </div>

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
              <div style={{ height: '1px', background: 'var(--color-border)', margin: '0.25rem 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-primary)' }}>
                <span>সর্বমোট বিল:</span>
                <span>৳{order.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Update Status Form */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>অর্ডার স্ট্যাটাস আপডেট</h3>

          {saveSuccess && (
            <div style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
              <CheckCircle2 size={16} /> স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!
            </div>
          )}

          <form onSubmit={handleUpdateStatus}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">বর্তমান অবস্থা নির্বাচন করুন</label>
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
              >
                <option value="pending">অপেক্ষমান (Pending)</option>
                <option value="preparing">প্যাকেজিং / প্রস্তুত হচ্ছে (Preparing)</option>
                <option value="ready_for_dispatch">প্রেরণে প্রস্তুত (Ready for Dispatch)</option>
                <option value="assigned">রাইডার অ্যাসাইনকৃত (Assigned)</option>
                <option value="out_for_delivery">ডেলিভারির পথে (Out for Delivery)</option>
                <option value="handed_over">পণ্য হস্তান্তরিত (Handed Over)</option>
                <option value="receipt_confirmed">গ্রাহক গৃহীত ও নিশ্চিত (Receipt Confirmed)</option>
                <option value="delivery_issue">ডেলিভারি সমস্যা (Issue Reported)</option>
                <option value="cancelled">বাতিল (Cancelled)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
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

      {/* RIDER ASSIGNMENT / REASSIGNMENT MODAL */}
      {showAssignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--color-surface)', maxWidth: '480px', width: '100%', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {order.assignedDeliveryPersonId ? 'রাইডার পরিবর্তন (Reassign Order)' : 'ডেলিভারি রাইডার নিয়োগ'}
              </h3>
              <button onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {assignError && (
              <div style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{assignError}</span>
              </div>
            )}

            <form onSubmit={handleAssignRider}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">উপলব্ধ রাইডার নির্বাচন করুন</label>
                <select
                  className="form-select"
                  value={selectedRiderId}
                  onChange={(e) => setSelectedRiderId(e.target.value)}
                  required
                >
                  {riders.map(r => (
                    <option key={r.id} value={r.uid}>
                      {r.name} ({r.availability === 'available' ? '🟢 রেডি' : r.availability === 'in_order' ? '🟡 অর্ডারে' : '🔴 অফলাইন'}) — {r.currentActiveDeliveries || 0}/{r.schedule?.maxActiveDeliveries || 2} অ্যাক্টিভ
                    </option>
                  ))}
                </select>
              </div>

              {currentRider && (
                <div style={{ background: 'var(--color-surface-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  <div><strong>যানবাহন:</strong> {currentRider.vehicleType} ({currentRider.vehiclePlateNumber || 'N/A'})</div>
                  <div><strong>মোবাইল:</strong> {currentRider.phone}</div>
                  <div><strong>শিডিউল:</strong> {currentRider.schedule?.startTime} - {currentRider.schedule?.endTime}</div>
                </div>
              )}

              {order.assignedDeliveryPersonId && (
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">পুনঃঅ্যাসাইনের কারণ (বাধ্যতামূলক)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="যেমন: পূর্ববর্তী রাইডারের বাইক নষ্ট অথবা বিলম্ব"
                    value={reassignReason}
                    onChange={(e) => setReassignReason(e.target.value)}
                    required
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    পূর্ববর্তী রাইডারের ট্র্যাকিং সেশন বাতিল হয়ে অডিট ট্রেইলে সংরক্ষিত হবে।
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAssignModal(false)} className="btn btn-outline">
                  বাতিল
                </button>
                <button type="submit" disabled={assigning} className="btn btn-primary">
                  {assigning ? 'নিয়োগ হচ্ছে...' : 'অ্যাসাইন নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
