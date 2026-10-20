import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  Truck,
  PackageCheck,
  Wallet,
  Calendar,
  User,
  LogOut,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { deliveryRepository } from '../repositories/deliveryRepository';
import { DeliveryAvailabilityStatus, DeliveryProfile } from '../models';
import './DeliveryLayout.css';

export const DeliveryLayout: React.FC = () => {
  const { currentUser, userProfile, isDeliveryPerson, isAdmin, logout } = useAuth();
  const [profile, setProfile] = useState<DeliveryProfile | null>(null);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const navigate = useNavigate();

  const isAuthorized = isDeliveryPerson || isAdmin;

  useEffect(() => {
    if (currentUser?.uid && isAuthorized) {
      loadProfile(currentUser.uid);
    }
  }, [currentUser?.uid, isAuthorized]);

  const loadProfile = async (uid: string) => {
    try {
      const p = await deliveryRepository.getDeliveryProfile(uid);
      setProfile(p);
    } catch (err) {
      console.warn('Failed to load rider profile:', err);
    }
  };

  const handleAvailabilityChange = async (newStatus: DeliveryAvailabilityStatus) => {
    if (!currentUser?.uid) return;
    setUpdatingAvailability(true);
    try {
      await deliveryRepository.updateAvailability(currentUser.uid, newStatus);
      if (profile) {
        setProfile({ ...profile, availability: newStatus });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthorized) {
    return (
      <div className="delivery-access-denied">
        <div className="delivery-denied-card">
          <AlertTriangle size={56} className="delivery-denied-icon" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            ডেলিভারি পোর্টাল সংরক্ষিত
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            এই সেকশনটি শুধুমাত্র অনুমোদিত ডেলিভারি কর্মীদের জন্য। আপনি যদি ডেলিভারি রাইডার হন, অনুগ্রহ করে আপনার অথোরাইজড একাউন্টে লগইন করুন।
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/login" className="btn btn-primary">
              লগইন করুন
            </Link>
            <Link to="/" className="btn btn-outline">
              হোমপেজে ফিরে যান
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentAvailability = profile?.availability || 'available';

  return (
    <div className="delivery-layout">
      {/* Top Bar */}
      <header className="delivery-header">
        <div className="delivery-header-inner">
          <Link to="/delivery" className="delivery-brand-link">
            <span style={{ fontSize: '1.75rem' }}>🚚</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                ফল মিষ্টি
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                ডেলিভারি ড্যাশবোর্ড
              </div>
            </div>
            <span className="delivery-brand-badge">Rider Portal</span>
          </Link>

          <div className="delivery-header-actions">
            {/* Availability Status Dropdown */}
            <div className="delivery-availability-select">
              <span className={`status-indicator-dot status-dot-${currentAvailability}`} />
              <select
                value={currentAvailability}
                disabled={updatingAvailability}
                onChange={(e) => handleAvailabilityChange(e.target.value as DeliveryAvailabilityStatus)}
              >
                <option value="available">🟢 রেডি / Available</option>
                <option value="in_order">🟡 অর্ডারে আছি / In Order</option>
                <option value="on_break">☕ বিরতিতে / On Break</option>
                <option value="unavailable">🔴 অফলাইন / Unavailable</option>
              </select>
              {updatingAvailability && <RefreshCw size={14} className="animate-spin" />}
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-outline btn-sm"
              style={{ gap: '0.4rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
              title="লগআউট"
            >
              <LogOut size={16} />
              <span className="hide-mobile">লগআউট</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="delivery-nav-bar">
          <div className="delivery-nav-inner">
            <NavLink to="/delivery" end className={({ isActive }) => `delivery-nav-item ${isActive ? 'active' : ''}`}>
              <Truck size={18} />
              <span>চলমান ডেলিভারি</span>
            </NavLink>
            <NavLink to="/delivery/history" className={({ isActive }) => `delivery-nav-item ${isActive ? 'active' : ''}`}>
              <PackageCheck size={18} />
              <span>ডেলিভারি হিস্ট্রি</span>
            </NavLink>
            <NavLink to="/delivery/earnings" className={({ isActive }) => `delivery-nav-item ${isActive ? 'active' : ''}`}>
              <Wallet size={18} />
              <span>আয় ও লেজার</span>
            </NavLink>
            <NavLink to="/delivery/schedule" className={({ isActive }) => `delivery-nav-item ${isActive ? 'active' : ''}`}>
              <Calendar size={18} />
              <span>শিডিউল ও সময়</span>
            </NavLink>
            <NavLink to="/delivery/profile" className={({ isActive }) => `delivery-nav-item ${isActive ? 'active' : ''}`}>
              <User size={18} />
              <span>প্রোফাইল</span>
            </NavLink>
          </div>
        </nav>
      </header>

      {/* Main Delivery View */}
      <main className="delivery-content">
        <Outlet context={{ profile, reloadProfile: () => currentUser?.uid && loadProfile(currentUser.uid) }} />
      </main>
    </div>
  );
};
