import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart, Check } from 'lucide-react';
import { Product } from '../models';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, cart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const isFav = isInWishlist(product.id);
  const cartItem = cart.find(item => item.product.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart(product, 1);
    }
  };

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;

  return (
    <div className={`product-card ${isOutOfStock ? 'out-of-stock-card' : ''}`}>
      {/* Top Media Area */}
      <Link to={`/product/${product.id}`} className="card-media-wrap">
        <img
          src={product.imageUrl}
          alt={product.nameBn}
          className="card-image"
          loading="lazy"
        />

        {/* Badges */}
        <div className="card-badges">
          {discountPercent > 0 && (
            <span className="badge badge-discount">{discountPercent}% ছাড়</span>
          )}
          {product.isSeasonal && (
            <span className="badge badge-seasonal">মৌসুমি</span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          className={`wishlist-toggle-btn ${isFav ? 'is-active' : ''}`}
          onClick={handleWishlistToggle}
          title={isFav ? 'পছন্দ তালিকা থেকে সরান' : 'পছন্দ তালিকায় যুক্ত করুন'}
          aria-label="উইশলিস্ট"
        >
          <Heart size={18} fill={isFav ? '#dc2626' : 'none'} color={isFav ? '#dc2626' : '#4b5563'} />
        </button>

        {isOutOfStock && (
          <div className="out-of-stock-overlay">
            <span>স্টক শেষ</span>
          </div>
        )}
      </Link>

      {/* Card Content Area */}
      <div className="card-content">
        <div className="card-header-row">
          <span className="card-category">
            {product.category === 'fruits' ? 'তাজা ফল' : 'ঐতিহ্যবাহী মিষ্টি'}
          </span>
          <div className="card-rating">
            <Star size={14} className="star-icon" fill="#fab818" color="#fab818" />
            <span className="rating-val">{product.rating.toFixed(1)}</span>
            <span className="rating-count">({product.reviewCount})</span>
          </div>
        </div>

        <Link to={`/product/${product.id}`} className="card-title-link">
          <h3 className="card-title-bn">{product.nameBn}</h3>
          <span className="card-title-eng">{product.name}</span>
        </Link>

        <span className="card-unit-badge">{product.unit}</span>

        {/* Price & Action Row */}
        <div className="card-footer-row">
          <div className="price-block">
            <span className="current-price">
              ৳{product.discountPrice ? product.discountPrice : product.price}
            </span>
            {product.discountPrice && (
              <span className="regular-price">৳{product.price}</span>
            )}
          </div>

          <button
            className={`btn-add-cart ${inCartQty > 0 ? 'in-cart' : ''}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            title={isOutOfStock ? 'স্টক শেষ' : 'কার্টে যোগ করুন'}
          >
            {inCartQty > 0 ? (
              <>
                <Check size={16} />
                <span>যোগ করা ({inCartQty})</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                <span>কার্ট</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
