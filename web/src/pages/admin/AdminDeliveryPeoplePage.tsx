import React, { useEffect, useState } from 'react';
import {
  Truck,
  PlusCircle,
  UserCheck,
  UserX,
  Phone,
  Calendar,
  Clock,
  Shield,
  Search,
  DollarSign,
  AlertTriangle,
  X,
  CheckCircle2
} from 'lucide-react';
import { deliveryRepository } from '../../repositories/deliveryRepository';
import { DeliveryProfile, DeliverySchedule, DeliveryAvailabilityStatus } from '../../models';

export const AdminDeliveryPeoplePage: React.FC = () => {
  const [profiles, setProfiles] = useState<DeliveryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalMode, setModalMode] = useState<'new' | 'promote'>('new');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [targetUid, setTargetUid] = useState('');
  const [vehicleType, setVehicleType] = useState<DeliveryProfile['vehicleType']>('motorbike');
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState('');
  const [maxActive, setMaxActive] = useState(2);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const list = await deliveryRepository.getDeliveryProfiles();
      setProfiles(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (profile: DeliveryProfile) => {
    const nextStatus = profile.status === 'active' ? 'suspended' : 'active';
    const actionText = nextStatus === 'suspended' ? 'সাময়িকভাবে স্থগিত (Suspend)' : 'পুনরায় সক্রিয় (Activate)';
    if (!window.confirm(`আপনি কি ${profile.name}-এর একাউন্ট ${actionText} করতে চান?`)) return;

    try {
      const updated: DeliveryProfile = {
        ...profile,
        status: nextStatus,
        availability: nextStatus === 'suspended' ? 'unavailable' : 'available'
      };
      await deliveryRepository.saveDeliveryProfile(updated);
      await loadProfiles();
      setActionMessage(`${profile.name}-এর স্ট্যাটাস সফলভাবে পরিবর্তিত হয়েছে।`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRider = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const riderUid = modalMode === 'promote' && targetUid.trim() ? targetUid.trim() : `rider_${Date.now()}`;
      const newProfile: DeliveryProfile = {
        id: riderUid,
        uid: riderUid,
        name,
        phone,
        email,
        status: 'active',
        availability: 'available',
        currentActiveDeliveries: 0,
        currentActiveOrderId: null,
        vehicleType,
        vehiclePlateNumber,
        totalCompletedDeliveries: 0,
        totalEarnedDeliveryCharge: 0,
        totalPaidAmount: 0,
        outstandingPayableAmount: 0,
        schedule: {
          workingDays: [0, 1, 2, 3, 4, 5, 6],
          startTime: '09:00',
          endTime: '19:00',
          breakStartTime: '13:00',
          breakEndTime: '14:00',
          isLeaveToday: false,
          maxActiveDeliveries: Number(maxActive)
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await deliveryRepository.saveDeliveryProfile(newProfile);
      await loadProfiles();
      setShowAddModal(false);
      resetForm();
      setActionMessage('নতুন ডেলিভারি কর্মী সফলভাবে অন্তর্ভুক্ত করা হয়েছে!');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'যুক্ত করতে সমস্যা হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setTargetUid('');
    setVehiclePlateNumber('');
    setMaxActive(2);
  };

  const filteredProfiles = profiles.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
            ডেলিভারি কর্মী ব্যবস্থাপনা (Delivery People) 🚴
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            রাইডারদের শিডিউল, প্রাপ্যতা, একাউন্ট স্ট্যাটাস ও কার্যক্ষমতা পর্যবেক্ষণ করুন
          </p>
        </div>

        <button
          onClick={() => { setShowAddModal(true); resetForm(); }}
          className="btn btn-primary btn-md"
          style={{ gap: '0.5rem' }}
        >
          <PlusCircle size={18} />
          <span>নতুন রাইডার যুক্ত করুন</span>
        </button>
      </div>

      {actionMessage && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="নাম, মোবাইল বা ইমেইল দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <select
          className="form-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ width: '180px' }}
        >
          <option value="all">সকল স্ট্যাটাস</option>
          <option value="active">সক্রিয় (Active)</option>
          <option value="suspended">স্থগিত (Suspended)</option>
        </select>
      </div>

      {/* Table Card */}
      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            রাইডার তথ্য লোড হচ্ছে...
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            কোনো ডেলিভারি কর্মীর তথ্য পাওয়া যায়নি।
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem' }}>রাইডারের তথ্য</th>
                  <th style={{ padding: '1rem' }}>প্রাপ্যতা (Availability)</th>
                  <th style={{ padding: '1rem' }}>যানবাহন</th>
                  <th style={{ padding: '1rem' }}>চলমান/মোট ডেলিভারি</th>
                  <th style={{ padding: '1rem' }}>বকেয়া পাওনা</th>
                  <th style={{ padding: '1rem' }}>অ্যাকাউন্ট স্ট্যাটাস</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>একশন</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((p) => {
                  const avail = p.availability || 'available';
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 800, color: 'var(--color-text)' }}>{p.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Phone size={12} />
                          <span>{p.phone}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{p.email}</div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            background:
                              avail === 'available'
                                ? 'rgba(22, 163, 74, 0.15)'
                                : avail === 'in_order'
                                ? 'rgba(234, 179, 8, 0.15)'
                                : avail === 'on_break'
                                ? 'rgba(59, 130, 246, 0.15)'
                                : 'rgba(239, 68, 68, 0.15)',
                            color:
                              avail === 'available'
                                ? '#16a34a'
                                : avail === 'in_order'
                                ? '#b45309'
                                : avail === 'on_break'
                                ? '#2563eb'
                                : '#dc2626'
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background:
                                avail === 'available'
                                  ? '#16a34a'
                                  : avail === 'in_order'
                                  ? '#eab308'
                                  : avail === 'on_break'
                                  ? '#3b82f6'
                                  : '#ef4444'
                            }}
                          />
                          <span>
                            {avail === 'available'
                              ? 'রেডি (Available)'
                              : avail === 'in_order'
                              ? 'অর্ডারে আছে'
                              : avail === 'on_break'
                              ? 'বিরতিতে'
                              : 'অফলাইন'}
                          </span>
                        </span>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600 }}>
                          {p.vehicleType === 'motorbike'
                            ? '🏍️ মোটরসাইকেল'
                            : p.vehicleType === 'bicycle'
                            ? '🚲 বাইসাইকেল'
                            : p.vehicleType === 'van'
                            ? '🚐 ভ্যান'
                            : '🚶 হাঁটা'}
                        </div>
                        {p.vehiclePlateNumber && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {p.vehiclePlateNumber}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <div>
                          <strong>{p.currentActiveDeliveries || 0}</strong> / {p.schedule?.maxActiveDeliveries || 2} চলমান
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          মোট সম্পন্ন: {p.totalCompletedDeliveries || 0} টি
                        </div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 800, color: p.outstandingPayableAmount > 0 ? '#b45309' : '#16a34a' }}>
                          ৳{p.outstandingPayableAmount || 0}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          পরিশোধিত: ৳{p.totalPaidAmount || 0}
                        </div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <span
                          className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-danger'}`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {p.status === 'active' ? 'সক্রিয়' : 'স্থগিত'}
                        </span>
                      </td>

                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`btn ${p.status === 'active' ? 'btn-outline' : 'btn-primary'} btn-sm`}
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                        >
                          {p.status === 'active' ? 'স্থগিত করুন' : 'সক্রিয় করুন'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / PROMOTE MODAL */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--color-surface)', maxWidth: '520px', width: '100%', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {modalMode === 'new' ? 'নতুন ডেলিভারি কর্মী নিবন্ধন' : 'বিদ্যমান গ্রাহককে রাইডার বানান'}
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Mode Toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--color-surface-subtle)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
              <button
                type="button"
                onClick={() => setModalMode('new')}
                style={{
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: modalMode === 'new' ? 'var(--color-primary)' : 'transparent',
                  color: modalMode === 'new' ? '#fff' : 'var(--color-text)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                নতুন একাউন্ট
              </button>
              <button
                type="button"
                onClick={() => setModalMode('promote')}
                style={{
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: modalMode === 'promote' ? 'var(--color-primary)' : 'transparent',
                  color: modalMode === 'promote' ? '#fff' : 'var(--color-text)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                গ্রাহককে প্রমোট করুন
              </button>
            </div>

            <form onSubmit={handleCreateRider}>
              {modalMode === 'promote' && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">বিদ্যমান গ্রাহকের User UID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="গ্রাহকের UID পেস্ট করুন"
                    value={targetUid}
                    onChange={(e) => setTargetUid(e.target.value)}
                    required
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    গ্রাহকের পূর্বের অর্ডার হিস্ট্রি অক্ষত থাকবে।
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">রাইডারের নাম</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">মোবাইল নম্বর</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">ইমেইল ঠিকানা</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="rider@folmishti.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">যানবাহনের ধরন</label>
                  <select
                    className="form-select"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value as any)}
                  >
                    <option value="motorbike">মোটরসাইকেল</option>
                    <option value="bicycle">বাইসাইকেল</option>
                    <option value="van">ভ্যান</option>
                    <option value="walking">পায়ে হেঁটে</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">একসাথে সর্বোচ্চ ডেলিভারি</label>
                  <select
                    className="form-select"
                    value={maxActive}
                    onChange={(e) => setMaxActive(Number(e.target.value))}
                  >
                    <option value={1}>১ টি</option>
                    <option value={2}>২ টি (স্ট্যান্ডার্ড)</option>
                    <option value={3}>৩ টি (সর্বোচ্চ)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">
                  বাতিল
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'যুক্ত হচ্ছে...' : 'রাইডার হিসেবে সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
