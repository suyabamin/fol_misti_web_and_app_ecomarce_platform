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
  CheckCircle2,
  Users,
  Zap,
  Check,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { deliveryRepository } from '../../repositories/deliveryRepository';
import { userRepository } from '../../repositories/userRepository';
import { DeliveryProfile, DeliverySchedule, DeliveryAvailabilityStatus } from '../../models';
import { RegisteredUserItem } from '../../data/initialData';

export const AdminDeliveryPeoplePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'riders' | 'users'>('riders');

  // Existing Delivery Profiles State
  const [profiles, setProfiles] = useState<DeliveryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Registered Users State
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilterRole, setUserFilterRole] = useState<string>('all');
  const [assigningUid, setAssigningUid] = useState<string | null>(null);

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
    loadUsers();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const list = await deliveryRepository.getDeliveryProfiles();
      setProfiles(list);
    } catch (err) {
      console.error('Failed to load profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const list = await userRepository.getRegisteredUsers();
      setRegisteredUsers(list);
    } catch (err) {
      console.error('Failed to load registered users:', err);
    } finally {
      setLoadingUsers(false);
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

  // 1-Click Assign User as Delivery Rider
  const handleOneClickAssign = async (user: RegisteredUserItem) => {
    setAssigningUid(user.uid);
    try {
      await deliveryRepository.assignUserAsDeliveryRider({
        uid: user.uid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        vehicleType: 'motorbike',
        vehiclePlateNumber: 'ঢাকা মেট্রো-হ ' + Math.floor(1000 + Math.random() * 9000)
      });
      await userRepository.updateUserRole(user.uid, 'delivery');
      await loadProfiles();
      await loadUsers();
      setActionMessage(`⚡ ${user.name}-কে সফলভাবে ডেলিভারি রাইডার হিসেবে নিযুক্ত করা হয়েছে! 🚴`);
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      alert(err?.message || 'রাইডার নিযুক্ত করতে সমস্যা হয়েছে।');
    } finally {
      setAssigningUid(null);
    }
  };

  // Revert / Remove Rider Role
  const handleRemoveRiderRole = async (user: RegisteredUserItem) => {
    if (!window.confirm(`আপনি কি ${user.name}-এর রাইডার পদ বাতিল করে সাধারণ গ্রাহক করতে চান?`)) return;
    setAssigningUid(user.uid);
    try {
      const existing = profiles.find(p => p.uid === user.uid || p.id === user.uid);
      if (existing) {
        await deliveryRepository.saveDeliveryProfile({
          ...existing,
          status: 'suspended',
          availability: 'unavailable'
        });
      }
      await userRepository.updateUserRole(user.uid, 'customer');
      await loadProfiles();
      await loadUsers();
      setActionMessage(`${user.name}-এর রাইডার পদ বাতিল করা হয়েছে।`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(err?.message || 'সমস্যা হয়েছে।');
    } finally {
      setAssigningUid(null);
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
      if (modalMode === 'promote' && targetUid.trim()) {
        await userRepository.updateUserRole(targetUid.trim(), 'delivery');
      }
      await loadProfiles();
      await loadUsers();
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

  const filteredUsers = registeredUsers.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearchQuery)) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchRole = userFilterRole === 'all' || u.role === userFilterRole;
    return matchSearch && matchRole;
  });

  const isUserActiveRider = (uid: string) => {
    return profiles.some(p => (p.uid === uid || p.id === uid) && p.status === 'active');
  };

  const availableRidersCount = profiles.filter(p => p.availability === 'available' && p.status === 'active').length;
  const busyRidersCount = profiles.filter(p => p.availability === 'in_order' && p.status === 'active').length;
  const candidateUsersCount = registeredUsers.filter(u => !isUserActiveRider(u.uid)).length;

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
            ডেলিভারি কর্মী ব্যবস্থাপনা (Delivery People) 🚴
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            সকল নিবন্ধিত ইউজার দেখুন এবং যেকোনো ইউজারকে ১-ক্লিকেই ডেলিভারি রাইডার হিসেবে নিয়োগ দিন
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

      {/* Action Notification Banner */}
      {actionMessage && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <CheckCircle2 size={18} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Quick Summary Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--color-surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>মোট ডেলিভারি রাইডার</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginTop: '0.25rem' }}>{profiles.length} জন</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '0.25rem' }}>সক্রিয় ও প্রস্তুত: {availableRidersCount} জন</div>
        </div>

        <div style={{ background: 'var(--color-surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>চলমান ডেলিভারিতে ব্যস্ত</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#b45309', marginTop: '0.25rem' }}>{busyRidersCount} জন</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>লাইভ জিপিএস সক্রিয়</div>
        </div>

        <div style={{ background: 'var(--color-surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>মোট নিবন্ধিত ব্যবহারকারী</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb', marginTop: '0.25rem' }}>{registeredUsers.length} জন</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>প্ল্যাটফর্মে রেজিস্টার্ড একাউন্ট</div>
        </div>

        <div style={{ background: 'var(--color-surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>১-ক্লিকে নিয়োগযোগ্য প্রার্থী</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '0.25rem' }}>{candidateUsersCount} জন</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '0.25rem' }}>সরাসরি রাইডার হতে প্রস্তুত</div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--color-border)', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('riders')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'riders' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'riders' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-2px',
            transition: 'all 0.2s'
          }}
        >
          <Truck size={18} />
          <span>বর্তমান রাইডারবৃন্দ ({profiles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'users' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'users' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-2px',
            transition: 'all 0.2s'
          }}
        >
          <Users size={18} />
          <span>সকল নিবন্ধিত ব্যবহারকারী — ১-ক্লিক নিয়োগ ({registeredUsers.length})</span>
          <span style={{ background: '#16a34a', color: '#fff', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
            ১-ক্লিক অ্যাসাইন
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXISTING DELIVERY RIDERS LIST                                     */}
      {/* ========================================================================= */}
      {activeTab === 'riders' && (
        <div>
          {/* Quick Callout to Tab 2 */}
          <div style={{ background: 'rgba(24, 121, 78, 0.08)', border: '1px dashed var(--color-primary)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--color-text)' }}>নিবন্ধিত যে কাউকে সরাসরি রাইডার বানাতে চান?</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  প্ল্যাটফর্মের নিবন্ধিত ব্যবহারকারী তালিকা থেকে যেকোনো ইউজারকে একটি ক্লিকেই ডেলিভারি কর্মী হিসেবে নিযুক্ত করতে পারবেন।
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('users')}
              className="btn btn-outline btn-sm"
              style={{ gap: '0.4rem', fontWeight: 700 }}
            >
              <span>নিবন্ধিত ব্যবহারকারী তালিকা দেখুন</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Filter and Search Bar */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="নাম, মোবাইল বা ইমেইল দিয়ে রাইডার খুঁজুন..."
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ALL REGISTERED USERS & 1-CLICK ASSIGN RIDER                       */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div>
          {/* Informational Guidance Banner */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-sm)' }}>
            <Users size={24} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, color: 'var(--color-text)' }}>
                নিবন্ধিত ব্যবহারকারী ও ১-ক্লিকে রাইডার নিয়োগ ব্যবস্থা ⚡
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                নিচের যেকোনো নিবন্ধিত ব্যবহারকারীকে মাত্র ১-ক্লিকে সক্রিয় ডেলিভারি রাইডার হিসেবে নিয়োগ দিতে পারবেন। নিয়োগ সম্পন্ন হলে তিনি সাথে সাথে রাইডার পোর্টালে এক্সেস পাবেন এবং তাকে অর্ডার ডেলিভারি অ্যাসাইন করা যাবে।
              </div>
            </div>
          </div>

          {/* User Search & Role Filters */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="নিবন্ধিত ব্যবহারকারীর নাম, ইমেইল বা মোবাইল দিয়ে খুঁজুন..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            <select
              className="form-select"
              value={userFilterRole}
              onChange={(e) => setUserFilterRole(e.target.value)}
              style={{ width: '180px' }}
            >
              <option value="all">সকল ভূমিকা (All Roles)</option>
              <option value="customer">সাধারণ গ্রাহক (Customer)</option>
              <option value="delivery">ডেলিভারি রাইডার (Rider)</option>
              <option value="admin">অ্যাডমিন (Admin)</option>
            </select>
          </div>

          {/* Registered Users Table Card */}
          <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            {loadingUsers ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                নিবন্ধিত ব্যবহারকারীদের তথ্য লোড হচ্ছে...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                কোনো নিবন্ধিত ব্যবহারকারী পাওয়া যায়নি।
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-surface-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ padding: '1rem' }}>ব্যবহারকারীর বিবরণ</th>
                      <th style={{ padding: '1rem' }}>মোবাইল নম্বর</th>
                      <th style={{ padding: '1rem' }}>এলাকা / জেলা</th>
                      <th style={{ padding: '1rem' }}>অর্ডার সংখ্যা ও মোট খরচ</th>
                      <th style={{ padding: '1rem' }}>বর্তমান পদ / ভূমিকা</th>
                      <th style={{ padding: '1rem' }}>রাইডার স্ট্যাটাস</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>১-ক্লিক অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const isRider = isUserActiveRider(user.uid) || user.role === 'delivery';
                      const isAssigning = assigningUid === user.uid;

                      return (
                        <tr key={user.uid} style={{ borderBottom: '1px solid var(--color-border)', background: isRider ? 'rgba(24, 121, 78, 0.02)' : 'transparent' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 800, color: 'var(--color-text)' }}>{user.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user.email}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                              UID: <code style={{ background: 'var(--color-surface-subtle)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>{user.uid}</code>
                            </div>
                          </td>

                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text)' }}>
                              <Phone size={13} style={{ color: 'var(--color-text-muted)' }} />
                              <span>{user.phone || 'মোবাইল যুক্ত নেই'}</span>
                            </div>
                          </td>

                          <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>
                            {user.district || 'ঢাকা'}
                          </td>

                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 700 }}>{user.ordersCount || 0} টি অর্ডার</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              মোট: ৳{user.totalSpent || 0}
                            </div>
                          </td>

                          <td style={{ padding: '1rem' }}>
                            <span
                              style={{
                                padding: '0.2rem 0.55rem',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background:
                                  user.role === 'admin'
                                    ? 'rgba(198, 40, 40, 0.1)'
                                    : user.role === 'delivery' || isRider
                                    ? 'rgba(24, 121, 78, 0.12)'
                                    : 'rgba(0, 0, 0, 0.06)',
                                color:
                                  user.role === 'admin'
                                    ? 'var(--color-danger)'
                                    : user.role === 'delivery' || isRider
                                    ? 'var(--color-primary)'
                                    : 'var(--color-text)'
                              }}
                            >
                              {user.role === 'admin' ? 'অ্যাডমিন' : isRider ? 'ডেলিভারি রাইডার' : 'সাধারণ গ্রাহক'}
                            </span>
                          </td>

                          <td style={{ padding: '1rem' }}>
                            {isRider ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#16a34a', fontWeight: 700, fontSize: '0.8rem' }}>
                                <Check size={14} />
                                <span>ইতিমধ্যে রাইডার</span>
                              </span>
                            ) : (
                              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                                রাইডার পদে নেই
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            {isRider ? (
                              <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
                                <button
                                  onClick={() => {
                                    setActiveTab('riders');
                                    setSearchQuery(user.name);
                                  }}
                                  className="btn btn-outline btn-sm"
                                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                                  title="রাইডার প্রোফাইল দেখুন"
                                >
                                  প্রোফাইল
                                </button>
                                <button
                                  disabled={isAssigning}
                                  onClick={() => handleRemoveRiderRole(user)}
                                  className="btn btn-sm"
                                  style={{
                                    fontSize: '0.75rem',
                                    padding: '0.35rem 0.65rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#dc2626',
                                    border: '1px solid rgba(239, 68, 68, 0.2)'
                                  }}
                                  title="রাইডার পদ বাতিল করে গ্রাহক করুন"
                                >
                                  {isAssigning ? 'প্রক্রিয়াধীন...' : 'পদ বাতিল'}
                                </button>
                              </div>
                            ) : (
                              <button
                                disabled={isAssigning}
                                onClick={() => handleOneClickAssign(user)}
                                className="btn btn-primary btn-sm"
                                style={{
                                  fontSize: '0.8rem',
                                  padding: '0.4rem 0.85rem',
                                  gap: '0.35rem',
                                  fontWeight: 800,
                                  background: 'linear-gradient(135deg, #18794E 0%, #105C3A 100%)',
                                  boxShadow: '0 2px 8px rgba(24, 121, 78, 0.25)',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <Zap size={14} />
                                <span>{isAssigning ? 'নিযুক্ত হচ্ছে...' : '১-ক্লিকে রাইডার বানান'}</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE / PROMOTE MODAL (Preserved 100%)                                   */}
      {/* ========================================================================= */}
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
                  <label className="form-label">বিদ্যমান গ্রাহক নির্বাচন করুন অথবা UID লিখুন</label>
                  {registeredUsers.length > 0 && (
                    <select
                      className="form-select"
                      style={{ marginBottom: '0.5rem' }}
                      value={targetUid}
                      onChange={(e) => {
                        const selectedUid = e.target.value;
                        setTargetUid(selectedUid);
                        const found = registeredUsers.find(u => u.uid === selectedUid);
                        if (found) {
                          setName(found.name);
                          setEmail(found.email);
                          setPhone(found.phone || '');
                        }
                      }}
                    >
                      <option value="">-- নিবন্ধিত গ্রাহক তালিকা থেকে নির্বাচন করুন --</option>
                      {registeredUsers.map(u => (
                        <option key={u.uid} value={u.uid}>
                          {u.name} ({u.email}) {isUserActiveRider(u.uid) ? '— ইতিমধ্যে রাইডার' : ''}
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    className="form-input"
                    placeholder="অথবা সরাসরি গ্রাহকের UID পেস্ট করুন"
                    value={targetUid}
                    onChange={(e) => setTargetUid(e.target.value)}
                    required
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    গ্রাহকের পূর্বের অ্যাকাউন্ট ও অর্ডার হিস্ট্রি অক্ষত থাকবে।
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
