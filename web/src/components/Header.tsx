import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User as UserIcon, Menu, X, Shield, PhoneCall } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { itemCount, subtotal } = useCart();
  const { wishlist } = useWishlist();
  const { currentUser, isAdmin } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="site-header">
      <div className="container header-main">
        {/* Mobile menu toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="মেনু খুলুন"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="logo-icon-wrapper">
            <span className="logo-symbol">🥭</span>
          </div>
          <div className="brand-text">
            <div className="brand-title-wrap">
              <span className="brand-bangla">ফল মিষ্টি</span>
              <span className="brand-english">Fol Mishti</span>
            </div>
            <span className="brand-tagline">ফলও মিষ্টি, আনন্দে ভরা প্রতিটি দিন।</span>
          </div>
        </Link>

        {/* Search Bar */}
        <form className="header-search" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="আম, লিচু, চমচম, মিষ্টি দই খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn" aria-label="খুঁজুন">
            <Search size={18} />
          </button>
        </form>

        {/* Right Actions */}
        <div className="header-actions">
          <div className="hotline-badge">
            <PhoneCall size={16} className="hotline-icon" />
            <div className="hotline-text">
              <span className="hotline-label">হটলাইন সাপোর্ট</span>
              <span className="hotline-number">০১৭১২-৩৪৫৬৭৮</span>
            </div>
          </div>

          <Link to="/wishlist" className="action-item" title="উইশলিস্ট">
            <div className="icon-badge-wrap">
              <Heart size={22} />
              {wishlist.length > 0 && (
                <span className="badge-count">{wishlist.length}</span>
              )}
            </div>
            <span className="action-label">পছন্দ</span>
          </Link>

          <Link to="/cart" className="action-item cart-action" title="শপিং কার্ট">
            <div className="icon-badge-wrap">
              <ShoppingBag size={22} />
              {itemCount > 0 && (
                <span className="badge-count">{itemCount}</span>
              )}
            </div>
            <div className="cart-action-text">
              <span className="action-label">কার্ট</span>
              <span className="cart-total-badge">৳{subtotal}</span>
            </div>
          </Link>

          {currentUser ? (
            <div className="user-logged-wrap">
              <Link
                to={isAdmin ? '/admin' : '/account'}
                className="action-item user-btn"
                title="আমার একাউন্ট"
              >
                <UserIcon size={22} />
                <span className="action-label">
                  {isAdmin ? 'অ্যাডমিন' : 'একাউন্ট'}
                </span>
              </Link>
            </div>
          ) : (
            <Link to="/login" className="action-item login-btn" title="লগইন করুন">
              <UserIcon size={22} />
              <span className="action-label">লগইন</span>
            </Link>
          )}
        </div>
      </div>

      {/* Primary Navigation Bar */}
      <nav className={`header-nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
        <div className="container nav-inner">
          <ul className="nav-list">
            <li>
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>হোমপেজ</Link>
            </li>
            <li>
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)}>সকল পণ্য (Shop)</Link>
            </li>
            <li>
              <Link to="/fruits" onClick={() => setMobileMenuOpen(false)}>তাজা ফল (Fruits)</Link>
            </li>
            <li>
              <Link to="/sweets" onClick={() => setMobileMenuOpen(false)}>ঐতিহ্যবাহী মিষ্টি (Sweets)</Link>
            </li>
            <li>
              <Link to="/offers" onClick={() => setMobileMenuOpen(false)}>অফার ও কুপন</Link>
            </li>
            <li>
              <Link to="/order-tracking" onClick={() => setMobileMenuOpen(false)}>অর্ডার ট্র্যাকিং</Link>
            </li>
            <li>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)}>আমাদের সম্পর্কে</Link>
            </li>
            <li>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>যোগাযোগ</Link>
            </li>
            {isAdmin && (
              <li className="admin-nav-item">
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Shield size={16} /> অ্যাডমিন ড্যাশবোর্ড
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
};
