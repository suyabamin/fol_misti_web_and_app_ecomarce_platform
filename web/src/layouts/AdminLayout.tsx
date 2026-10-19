import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  ShoppingBag,
  Users,
  Star,
  Ticket,
  Image as ImageIcon,
  Palette,
  MessageSquare,
  MapPin,
  BarChart3,
  Boxes,
  Settings,
  User,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

export const AdminLayout: React.FC = () => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  // If not admin, show guarded access / prompt to sign in as admin
  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <div className="denied-card">
          <AlertTriangle size={52} className="denied-icon" />
          <h2>প্রবেশাধিকার সংরক্ষিত (Admin Only)</h2>
          <p>
            এই ড্যাশবোর্ডে শুধুমাত্র অনুমোদিত অ্যাডমিনিস্ট্রেটর প্রবেশ করতে পারেন।
          </p>
          <div className="denied-actions">
            <Link to="/login" className="btn btn-primary">
              অ্যাডমিন লগইন করুন
            </Link>
            <Link to="/" className="btn btn-subtle">
              হোমপেজে ফিরে যান
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleConfirmLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    navigate('/');
  };

  const navItems = [
    { to: '/admin', label: 'ড্যাশবোর্ড', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'পণ্যসমূহ', icon: Package },
    { to: '/admin/add-product', label: 'নতুন পণ্য যোগ', icon: PlusCircle },
    { to: '/admin/categories', label: 'ক্যাটাগরি', icon: FolderTree },
    { to: '/admin/orders', label: 'অর্ডার তালিকা', icon: ShoppingBag },
    { to: '/admin/customers', label: 'গ্রাহকবৃন্দ', icon: Users },
    { to: '/admin/reviews', label: 'রিভিউ মডারেশন', icon: Star },
    { to: '/admin/coupons', label: 'কুপন ও অফার', icon: Ticket },
    { to: '/admin/banners', label: 'ব্যানার স্লাইডার', icon: ImageIcon },
    { to: '/admin/appearance', label: 'থিম ও চেহারা', icon: Palette },
    { to: '/admin/chat', label: 'লাইভ সাপোর্ট ইনবক্স', icon: MessageSquare },
    { to: '/admin/delivery-areas', label: 'ডেলিভারি এরিয়া', icon: MapPin },
    { to: '/admin/reports', label: 'রিপোর্টস ও অ্যানালিটিক্স', icon: BarChart3 },
    { to: '/admin/stock', label: 'স্টক ম্যানেজমেন্ট', icon: Boxes },
    { to: '/admin/settings', label: 'স্টোর সেটিংস', icon: Settings },
    { to: '/admin/profile', label: 'অ্যাডমিন প্রোফাইল', icon: User }
  ];

  return (
    <div className="admin-wrapper">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-brand">
            <span className="admin-brand-icon">🥭</span>
            <div className="admin-brand-text">
              <span className="admin-brand-title">ফল মিষ্টি</span>
              <span className="admin-brand-sub">অ্যাডমিন কন্ট্রোল</span>
            </div>
          </Link>
          <button
            className="sidebar-close-btn"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="বন্ধ করুন"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `admin-nav-link ${isActive ? 'active' : ''}`
                }
                onClick={() => setMobileSidebarOpen(false)}
              >
                <Icon size={19} className="nav-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <button
            className="admin-nav-link logout-btn"
            onClick={() => setShowLogoutModal(true)}
          >
            <LogOut size={19} className="nav-icon" />
            <span>লগআউট করুন</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-wrap">
        {/* Top Navbar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              className="admin-menu-toggle"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="মেনু খুলুন"
            >
              <Menu size={22} />
            </button>
            <span className="topbar-welcome">
              স্বাগতম, <strong>{userProfile?.displayName || 'অ্যাডমিনিস্ট্রেটর'}</strong>
            </span>
          </div>

          <div className="topbar-right">
            <Link to="/" target="_blank" className="view-store-btn" title="ওয়েবসাইট দেখুন">
              <ExternalLink size={16} />
              <span>স্টোর দেখুন</span>
            </Link>

            <div className="admin-avatar-wrap">
              <div className="avatar-circle">
                {userProfile?.displayName?.charAt(0) || 'A'}
              </div>
              <div className="avatar-info">
                <span className="avatar-name">{userProfile?.displayName || 'অ্যাডমিন'}</span>
                <span className="avatar-role">সুপার অ্যাডমিন</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="admin-page-content">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal A16 */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-content logout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-header">
              <div className="logout-icon-wrap">
                <ShieldCheck size={28} className="logout-icon" />
              </div>
              <h3>আপনি কি নিশ্চিতভাবে লগআউট করতে চান?</h3>
              <p>অ্যাডমিন প্যানেল থেকে বের হয়ে সাধারণ গ্রাহক সাইটে ফিরে যাবেন।</p>
            </div>
            <div className="logout-modal-actions">
              <button
                className="btn btn-subtle"
                onClick={() => setShowLogoutModal(false)}
              >
                বাতিল করুন
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmLogout}
              >
                হ্যাঁ, লগআউট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
