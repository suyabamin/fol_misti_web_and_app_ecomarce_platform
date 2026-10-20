import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, MapPin, Heart, LogOut, Settings, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { orderRepository } from '../../repositories/orderRepository';
import { Order } from '../../models';

export const AccountPage: React.FC = () => {
  const { currentUser, userProfile, logout, updateUserDisplayName, isAdmin } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      if (currentUser) {
        const userOrders = await orderRepository.getByUser(currentUser.uid);
        setOrders(userOrders);
      }
    }
    loadOrders();
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim()) {
      await updateUserDisplayName(displayName.trim());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      <div className="breadcrumbs">
        <Link to="/">হোম</Link>
        <span>/</span>
        <span className="current">আমার একাউন্ট</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2.5rem', alignItems: 'start' }}>
        {/* Left Account Sidebar */}
        <aside
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          {/* User Summary */}
          <div style={{ textAlign: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border-subtle)', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                fontSize: '1.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem'
              }}
            >
              {userProfile?.displayName?.charAt(0) || 'U'}
            </div>
            <h3 style={{ fontSize: '1.15rem', margin: '0 0 0.25rem' }}>
              {userProfile?.displayName || 'সম্মানিত গ্রাহক'}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {currentUser?.email}
            </span>
            {isAdmin && (
              <div style={{ marginTop: '0.5rem' }}>
                <Link to="/admin" className="badge badge-accent" style={{ textDecoration: 'none' }}>
                  <Shield size={12} /> অ্যাডমিন ড্যাশবোর্ড
                </Link>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: activeTab === 'profile' ? 'var(--color-primary-light)' : 'transparent',
                color: activeTab === 'profile' ? 'var(--color-primary)' : 'var(--color-text)',
                fontWeight: 600,
                fontSize: '0.95rem',
                border: 'none',
                textAlign: 'left'
              }}
            >
              <User size={18} /> প্রোফাইল তথ্য
            </button>

            <Link
              to="/my-orders"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text)',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}
            >
              <Package size={18} /> আমার অর্ডারসমূহ ({orders.length})
            </Link>

            <Link
              to="/account/archive"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text)',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}
            >
              <CheckCircle size={18} style={{ color: '#16a34a' }} /> স্থায়ী অর্ডার আর্কাইভ
            </Link>

            <Link
              to="/wishlist"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text)',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}
            >
              <Heart size={18} /> পছন্দের তালিকা ({wishlist.length})
            </Link>

            <button
              onClick={() => setActiveTab('addresses')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: activeTab === 'addresses' ? 'var(--color-primary-light)' : 'transparent',
                color: activeTab === 'addresses' ? 'var(--color-primary)' : 'var(--color-text)',
                fontWeight: 600,
                fontSize: '0.95rem',
                border: 'none',
                textAlign: 'left'
              }}
            >
              <MapPin size={18} /> ঠিকানা ব্যবস্থাপনা
            </button>

            <div style={{ height: '1px', background: 'var(--color-border)', margin: '0.75rem 0' }}></div>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-danger)',
                fontWeight: 600,
                fontSize: '0.95rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer'
              }}
            >
              <LogOut size={18} /> লগআউট করুন
            </button>
          </div>
        </aside>

        {/* Right Tab Content */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          {/* Quick Metrics from reference image 12 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--color-surface-subtle)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'center' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>{orders.length}</span>
              <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>মোট সম্পন্ন অর্ডার</span>
            </div>
            <div style={{ background: 'var(--color-surface-subtle)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'center' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-secondary)' }}>
                {orders.filter(o => o.status === 'pending' || o.status === 'processing').length}
              </span>
              <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>চলমান অর্ডার</span>
            </div>
            <div style={{ background: 'var(--color-surface-subtle)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'center' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-accent)' }}>{wishlist.length}</span>
              <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>পছন্দের তালিকা</span>
            </div>
          </div>

          {activeTab === 'profile' && (
            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                প্রোফাইল তথ্য সম্পাদন
              </h2>

              {saveSuccess && (
                <div style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                  <CheckCircle size={18} /> প্রোফাইল সফলভাবে আপডেট করা হয়েছে!
                </div>
              )}

              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label className="form-label">নাম</label>
                  <input
                    type="text"
                    className="form-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">ইমেইল ঠিকানা</label>
                  <input
                    type="email"
                    className="form-input"
                    value={currentUser?.email || ''}
                    disabled
                  />
                  <small style={{ color: 'var(--color-text-muted)' }}>ইমেইল পরিবর্তনযোগ্য নয়।</small>
                </div>

                <div className="form-group">
                  <label className="form-label">মোবাইল নম্বর</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="017XXXXXXXX"
                    defaultValue={userProfile?.phone || ''}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                  পরিবর্তন সংরক্ষণ করুন
                </button>
              </form>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                সংরক্ষিত ডেলিভারি ঠিকানা
              </h2>

              <div style={{ background: 'var(--color-surface-subtle)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '1rem' }}>বাসা (প্রধান ঠিকানা)</strong>
                  <span className="badge badge-primary">ডিফল্ট</span>
                </div>
                <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  বাড়ি ১২, রোড ৭, সেক্টর ৩, উত্তরা, ঢাকা-১২৩০
                </p>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.35rem' }}>
                  মোবাইল: +880 1712-345678
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
