import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Star,
  Clock,
  Tag,
  ChevronRight
} from 'lucide-react';
import { productRepository } from '../../repositories/productRepository';
import { categoryRepository } from '../../repositories/categoryRepository';
import { bannerRepository } from '../../repositories/bannerRepository';
import { reviewRepository } from '../../repositories/reviewRepository';
import { Product, Category, Banner, Review } from '../../models';
import { ProductCard } from '../../components/ProductCard';
import './HomePage.css';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [seasonalProducts, setSeasonalProducts] = useState<Product[]>([]);
  const [sweetsProducts, setSweetsProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, featured, seasonal, allProducts, bans, revs] = await Promise.all([
          categoryRepository.getAll(),
          productRepository.getFeatured(),
          productRepository.getSeasonal(),
          productRepository.getAll(),
          bannerRepository.getAll(),
          reviewRepository.getAll()
        ]);

        setCategories(cats);
        setFeaturedProducts(featured.slice(0, 6));
        setSeasonalProducts(seasonal.slice(0, 4));
        setSweetsProducts(allProducts.filter(p => p.category === 'sweets').slice(0, 4));
        setBanners(bans.filter(b => b.isActive));
        setReviews(revs.filter(r => r.status === 'approved').slice(0, 3));
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const heroBanner = banners[0] || {
    title: 'তাজা ফল ও ঐতিহ্যবাহী মিষ্টি',
    subtitle: 'রাসায়নিকমুক্ত মৌসুমি ফল ও শতবর্ষী খাঁটি ছানার মিষ্টি এখন আপনার ঘরের দোরগোড়ায়।',
    badgeText: '২০% পর্যন্ত বিশেষ ছাড়!',
    imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1400&q=80',
    linkUrl: '/shop'
  };

  return (
    <div className="homepage">
      {/* Hero Banner Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <span className="hero-badge">
              <Sparkles size={16} /> {heroBanner.badgeText || 'সেরা দেশি স্বাদ'}
            </span>
            <h1 className="hero-title">{heroBanner.title}</h1>
            <p className="hero-subtitle">{heroBanner.subtitle}</p>
            <div className="hero-ctas">
              <Link to={heroBanner.linkUrl || '/shop'} className="btn btn-primary btn-lg">
                <span>এখনই অর্ডার করুন</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/fruits" className="btn btn-subtle btn-lg">
                <span>মৌসুমি ফল দেখুন</span>
              </Link>
            </div>
            {/* Quick trust metrics */}
            <div className="hero-trust-row">
              <div className="trust-item">
                <Truck size={18} className="trust-icon" />
                <span>দ্রুত হোম ডেলিভারি</span>
              </div>
              <div className="trust-item">
                <ShieldCheck size={18} className="trust-icon" />
                <span>ক্যাশ অন ডেলিভারি</span>
              </div>
            </div>
          </div>
          <div className="hero-image-wrap">
            <img
              src={heroBanner.imageUrl}
              alt="তাজা ফল ও মিষ্টি"
              className="hero-image"
            />
          </div>
        </div>
      </section>

      {/* Category Shortcuts */}
      <section className="section-categories">
        <div className="container">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">পণ্য ক্যাটাগরি</h2>
              <p className="section-subtitle">আপনার পছন্দের ক্যাটাগরি নির্বাচন করুন</p>
            </div>
            <Link to="/shop" className="view-all-link">
              <span>সব দেখুন</span>
              <ChevronRight size={18} />
            </Link>
          </div>

          <div className="categories-grid">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={cat.slug === 'fruits' ? '/fruits' : cat.slug === 'sweets' ? '/sweets' : `/shop?category=${cat.id}`}
                className="category-card"
              >
                <div className="cat-image-wrap">
                  <img src={cat.imageUrl} alt={cat.nameBn} className="cat-image" />
                </div>
                <div className="cat-info">
                  <h3 className="cat-name">{cat.nameBn}</h3>
                  <span className="cat-eng-name">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Seasonal Fruits */}
      <section className="section-products bg-subtle">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="badge badge-accent mb-1">মৌসুমের সেরা উপহার</span>
              <h2 className="section-title">টাটকা মৌসুমি ফলসমূহ</h2>
              <p className="section-subtitle">রাসায়নিক ও ফরমালিন মুক্ত গাছপাকা সেরা ফল</p>
            </div>
            <Link to="/fruits" className="btn btn-outline btn-sm">
              <span>সকল ফল দেখুন</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="products-grid">
            {seasonalProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Triple Banners */}
      <section className="section-promo-banners">
        <div className="container">
          <div className="promo-banners-grid">
            <div className="promo-card promo-orange">
              <div className="promo-badge">২০% ছাড়</div>
              <h3>আমের স্পেশাল মেলা</h3>
              <p>রাজশাহীর সেরা হিমসাগর ও আম্রপালি আমে বিশেষ মূল্যছাড়!</p>
              <Link to="/fruits" className="promo-link">অর্ডার করুন →</Link>
            </div>
            <div className="promo-card promo-green">
              <div className="promo-badge">৳১০০ ছাড়</div>
              <h3>ঐতিহ্যবাহী মিষ্টি ও দই</h3>
              <p>বগুড়ার আসল দই ও পোড়াবাড়ির চমচমে ৳১০০ ক্যাশব্যাক কুপন।</p>
              <Link to="/sweets" className="promo-link">সংগ্রহ করুন →</Link>
            </div>
            <div className="promo-card promo-gold">
              <div className="promo-badge">ফ্রি ডেলিভারি</div>
              <h3>স্পেশাল উৎসব প্যাকেজ</h3>
              <p>৳২,০০০ টাকার অধিক অর্ডারে সমগ্র বাংলাদেশে সম্পূর্ণ ফ্রি ডেলিভারি!</p>
              <Link to="/shop" className="promo-link">শপিং করুন →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bengali Sweets Collection */}
      <section className="section-products">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="badge badge-primary mb-1">ঐতিহ্যের স্বাদ</span>
              <h2 className="section-title">খাঁটি ছানার সুস্বাদু মিষ্টি</h2>
              <p className="section-subtitle">শতবর্ষের আদি কারিগরদের হাতে তৈরি ঐতিহ্যবাহী মিষ্টি</p>
            </div>
            <Link to="/sweets" className="btn btn-outline btn-sm">
              <span>সকল মিষ্টি দেখুন</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="products-grid">
            {sweetsProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-products bg-subtle">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="badge badge-accent mb-1">সর্বাধিক জনপ্রিয়</span>
              <h2 className="section-title">গ্রাহকদের পছন্দের সেরা পণ্য</h2>
              <p className="section-subtitle">আমাদের সবচেয়ে বেশি বিক্রীত ফল ও মিষ্টি</p>
            </div>
            <Link to="/shop" className="btn btn-outline btn-sm">
              <span>সব দেখুন</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews & Trust Section */}
      <section className="section-reviews">
        <div className="container">
          <div className="section-header-center">
            <span className="badge badge-success">সন্তুষ্ট গ্রাহকদের মতামত</span>
            <h2 className="section-title">গ্রাহকরা ফল মিষ্টি সম্পর্কে কী বলছেন?</h2>
            <p className="section-subtitle">আমাদের প্রতিটি ফল ও মিষ্টির আসল গ্রাহক রিভিউ</p>
          </div>

          <div className="reviews-grid">
            {reviews.map((rev) => (
              <div key={rev.id} className="review-card">
                <div className="review-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < rev.rating ? '#fab818' : '#e5e7eb'}
                      color={i < rev.rating ? '#fab818' : '#e5e7eb'}
                    />
                  ))}
                </div>
                <p className="review-text">"{rev.comment}"</p>
                <div className="review-author">
                  <div className="review-avatar">
                    {rev.userName.charAt(0)}
                  </div>
                  <div className="review-meta">
                    <span className="review-name">{rev.userName}</span>
                    <span className="review-product">{rev.productName || 'ভেরিফায়েড ক্রেতা'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
