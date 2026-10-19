import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { ProductCard } from '../../components/ProductCard';

export const WishlistPage: React.FC = () => {
  const { wishlist, clearWishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="container" style={{ paddingTop: '4rem', paddingBottom: '6rem', textAlign: 'center', maxWidth: '600px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--color-text-muted)' }}>
          <Heart size={44} />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>আপনার পছন্দের তালিকা খালি</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
          যেকোনো পণ্যের হৃদপিণ্ড আইকনে ক্লিক করে পরবর্তীতে কেনার জন্য পছন্দের তালিকায় রাখুন।
        </p>
        <Link to="/shop" className="btn btn-primary btn-lg">
          <span>পণ্যসমূহ দেখুন</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      <div className="breadcrumbs">
        <Link to="/">হোম</Link>
        <span>/</span>
        <span className="current">পছন্দের তালিকা</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>পছন্দের পণ্যসমূহ ({wishlist.length})</h1>
        </div>
        <button
          className="btn btn-subtle btn-sm"
          onClick={clearWishlist}
          style={{ color: 'var(--color-danger)' }}
        >
          <Trash2 size={16} /> তালিকা খালি করুন
        </button>
      </div>

      <div className="products-grid">
        {wishlist.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
