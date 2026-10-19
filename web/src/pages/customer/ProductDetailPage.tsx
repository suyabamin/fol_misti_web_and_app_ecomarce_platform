import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2,
  Share2,
  MessageSquare
} from 'lucide-react';
import { productRepository } from '../../repositories/productRepository';
import { reviewRepository } from '../../repositories/reviewRepository';
import { Product, Review } from '../../models';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { ProductCard } from '../../components/ProductCard';
import './ProductDetailPage.css';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Review form state
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { currentUser, userProfile } = useAuth();

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setLoading(true);
      try {
        const p = await productRepository.getById(id);
        if (p) {
          setProduct(p);
          setSelectedImage(p.imageUrl);
          const [all, revs] = await Promise.all([
            productRepository.getAll(),
            reviewRepository.getByProduct(p.id)
          ]);
          setRelatedProducts(all.filter(item => item.category === p.category && item.id !== p.id).slice(0, 4));
          setReviews(revs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
    setQuantity(1);
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0' }}>
        <div className="skeleton" style={{ height: '450px', borderRadius: '16px' }}></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>পণ্যটি খুঁজে পাওয়া যায়নি</h2>
        <Link to="/shop" className="btn btn-primary mt-2">সকল পণ্য দেখুন</Link>
      </div>
    );
  }

  const isFav = isInWishlist(product.id);
  const price = product.discountPrice || product.price;

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setReviewSubmitting(true);
    try {
      const rev = await reviewRepository.submitReview({
        productId: product.id,
        productName: product.nameBn,
        userId: currentUser?.uid || 'guest-reviewer',
        userName: userProfile?.displayName || currentUser?.displayName || 'সম্মানিত ক্রেতা',
        rating: newRating,
        comment: newComment.trim()
      });
      setReviews([rev, ...reviews]);
      setNewComment('');
      setReviewMessage('আপনার মূল্যবান মতামতের জন্য ধন্যবাদ!');
      setTimeout(() => setReviewMessage(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const gallery = [product.imageUrl, ...(product.galleryImages || [])];

  return (
    <div className="product-detail-page container">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <Link to="/">হোম</Link>
        <span>/</span>
        <Link to="/shop">শপ</Link>
        <span>/</span>
        <Link to={product.category === 'fruits' ? '/fruits' : '/sweets'}>
          {product.category === 'fruits' ? 'তাজা ফল' : 'ঐতিহ্যবাহী মিষ্টি'}
        </Link>
        <span>/</span>
        <span className="current">{product.nameBn}</span>
      </div>

      <div className="product-detail-grid">
        {/* Media / Gallery Area */}
        <div className="detail-media-col">
          <div className="main-image-wrap">
            <img src={selectedImage} alt={product.nameBn} className="detail-main-img" />
            {product.discountPrice && (
              <span className="detail-discount-badge">
                {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% ছাড়
              </span>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="thumbnail-row">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  className={`thumbnail-btn ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="detail-info-col">
          <div className="detail-category-badge">
            {product.category === 'fruits' ? 'তাজা ফল' : 'ঐতিহ্যবাহী মিষ্টি'}
          </div>

          <h1 className="detail-title-bn">{product.nameBn}</h1>
          <h2 className="detail-title-eng">{product.name}</h2>

          {/* Rating */}
          <div className="detail-rating-row">
            <div className="stars-wrap">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i < Math.floor(product.rating) ? '#fab818' : '#e5e7eb'}
                  color={i < Math.floor(product.rating) ? '#fab818' : '#e5e7eb'}
                />
              ))}
            </div>
            <span className="detail-rating-text">{product.rating.toFixed(1)}</span>
            <span className="detail-review-count">({reviews.length} টি কাস্টমার রিভিউ)</span>
          </div>

          {/* Price Box */}
          <div className="detail-price-box">
            <span className="detail-current-price">৳{price}</span>
            {product.discountPrice && (
              <span className="detail-regular-price">৳{product.price}</span>
            )}
            <span className="detail-unit">/ {product.unit}</span>
          </div>

          {/* Stock Availability */}
          <div className="stock-status-row">
            {product.stock > 0 ? (
              <span className="stock-badge in-stock">
                <CheckCircle2 size={16} /> স্টকে আছে ({product.stock} {product.unit.split(' ')[0]} অবশিষ্ট)
              </span>
            ) : (
              <span className="stock-badge out-stock">স্টক শেষ</span>
            )}
          </div>

          {/* Short description */}
          <p className="detail-description">{product.descriptionBn || product.description}</p>

          {/* Quantity Selector & Actions */}
          <div className="detail-actions-row">
            <div className="quantity-stepper">
              <button
                className="stepper-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </button>
              <span className="stepper-val">{quantity}</span>
              <button
                className="stepper-btn"
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= product.stock}
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              className="btn btn-primary btn-add-main"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              <ShoppingBag size={20} />
              <span>কার্টে যোগ করুন</span>
            </button>

            <button
              className="btn btn-secondary btn-buy-now"
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
            >
              <span>এখনই কিনুন</span>
            </button>

            <button
              className={`wishlist-icon-btn ${isFav ? 'is-fav' : ''}`}
              onClick={() => isFav ? removeFromWishlist(product.id) : addToWishlist(product)}
              title="পছন্দের তালিকায় রাখুন"
            >
              <Heart size={20} fill={isFav ? '#dc2626' : 'none'} color={isFav ? '#dc2626' : '#4b5563'} />
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="detail-trust-box">
            <div className="trust-point">
              <Truck size={18} className="trust-icon" />
              <div>
                <strong>দ্রুততম ডেলিভারি:</strong> ঢাকার মধ্যে ১২-২৪ ঘণ্টা, সারা দেশে ৪৮ ঘণ্টা।
              </div>
            </div>
            <div className="trust-point">
              <ShieldCheck size={18} className="trust-icon" />
              <div>
                <strong>ক্যাশ অন ডেলিভারি:</strong> পণ্য বুঝে পেয়ে মূল্য পরিশোধ করুন।
              </div>
            </div>
            <div className="trust-point">
              <RotateCcw size={18} className="trust-icon" />
              <div>
                <strong>মান নিশ্চয়তা:</strong> কোনো ক্ষতি বা ত্রুটি পেলে তাৎক্ষণিক পরিবর্তন বা রিফান্ড।
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="detail-reviews-section">
        <h3 className="section-title">গ্রাহকদের পর্যালোচনা ({reviews.length})</h3>

        <div className="reviews-layout">
          {/* List of Reviews */}
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews-msg">এই পণ্যের জন্য এখনো কোনো রিভিউ দেওয়া হয়নি। আপনিই প্রথম রিভিউ দিন!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="review-item-card">
                  <div className="review-item-header">
                    <div className="review-user-info">
                      <div className="review-user-avatar">{rev.userName.charAt(0)}</div>
                      <div>
                        <strong className="review-user-name">{rev.userName}</strong>
                        <div className="stars-wrap">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < rev.rating ? '#fab818' : '#e5e7eb'}
                              color={i < rev.rating ? '#fab818' : '#e5e7eb'}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="review-date">
                      {new Date(rev.createdAt).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                  <p className="review-body-text">{rev.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Submit Review Box */}
          <div className="submit-review-card">
            <h4>আপনার মতামত লিখুন</h4>
            {reviewMessage && (
              <div className="review-success-alert">{reviewMessage}</div>
            )}
            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label className="form-label">রেটিং নির্বাচন করুন:</label>
                <div className="rating-select-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="star-btn"
                      onClick={() => setNewRating(star)}
                    >
                      <Star
                        size={24}
                        fill={star <= newRating ? '#fab818' : 'none'}
                        color={star <= newRating ? '#fab818' : '#d1d5db'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">আপনার অভিজ্ঞতা বিস্তারিত লিখুন:</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="পণ্যটির স্বাদ, মান বা প্যাকেজিং কেমন লাগলো?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={reviewSubmitting || !newComment.trim()}
              >
                {reviewSubmitting ? 'জমা হচ্ছে...' : 'রিভিউ সাবমিট করুন'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="related-products-section">
          <h3 className="section-title">সংশ্লিষ্ট আরও পণ্য</h3>
          <div className="products-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
