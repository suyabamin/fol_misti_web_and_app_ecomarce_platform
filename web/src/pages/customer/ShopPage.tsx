import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, SearchX, Check } from 'lucide-react';
import { productRepository } from '../../repositories/productRepository';
import { categoryRepository } from '../../repositories/categoryRepository';
import { Product, Category } from '../../models';
import { ProductCard } from '../../components/ProductCard';
import './ShopPage.css';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [searchTerm, setSearchTerm] = useState<string>(queryParam);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [maxPrice, setMaxPrice] = useState<number>(1000);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  useEffect(() => {
    async function load() {
      try {
        const [prods, cats] = await Promise.all([
          productRepository.getAll(),
          categoryRepository.getAll()
        ]);
        setProducts(prods);
        setCategories(cats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Active check
        if (!p.isActive) return false;

        // Category filter
        if (selectedCategory !== 'all') {
          if (p.category !== selectedCategory && p.slug !== selectedCategory) {
            return false;
          }
        }

        // Search term filter
        if (searchTerm.trim()) {
          const s = searchTerm.toLowerCase();
          const matchName = p.name.toLowerCase().includes(s);
          const matchBn = p.nameBn.includes(searchTerm);
          if (!matchName && !matchBn) return false;
        }

        // In-stock filter
        if (onlyInStock && p.stock <= 0) return false;

        // Price filter
        const price = p.discountPrice || p.price;
        if (price > maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        const priceA = a.discountPrice || a.price;
        const priceB = b.discountPrice || b.price;

        if (sortBy === 'price-low') return priceA - priceB;
        if (sortBy === 'price-high') return priceB - priceA;
        if (sortBy === 'rating') return b.rating - a.rating;
        return b.reviewCount - a.reviewCount; // popular default
      });
  }, [products, selectedCategory, searchTerm, onlyInStock, maxPrice, sortBy]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setOnlyInStock(false);
    setMaxPrice(1000);
    setSortBy('popular');
    setSearchParams({});
  };

  return (
    <div className="shop-page container">
      {/* Breadcrumb */}
      <div className="breadcrumbs">
        <Link to="/">হোম</Link>
        <span>/</span>
        <span className="current">সকল পণ্য</span>
      </div>

      <div className="shop-header">
        <div>
          <h1 className="shop-title">ফল ও মিষ্টির সম্ভার</h1>
          <p className="shop-subtitle">
            মোট {filteredProducts.length} টি পণ্য পাওয়া গেছে
          </p>
        </div>

        {/* Sort selector */}
        <div className="sort-wrapper">
          <ArrowUpDown size={16} />
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="popular">জনপ্রিয়তা অনুসারে</option>
            <option value="price-low">মূল্য: কম থেকে বেশি</option>
            <option value="price-high">মূল্য: বেশি থেকে কম</option>
            <option value="rating">সর্বোচ্চ রেটিং</option>
          </select>
        </div>
      </div>

      <div className="shop-layout">
        {/* Sidebar Filters */}
        <aside className="shop-sidebar">
          <div className="filter-card">
            <div className="filter-title-row">
              <span className="filter-card-title">
                <SlidersHorizontal size={18} /> ফিল্টার
              </span>
              <button className="reset-filter-btn" onClick={resetFilters}>
                রিসেট
              </button>
            </div>

            {/* Categories */}
            <div className="filter-group">
              <h4 className="filter-group-title">ক্যাটাগরি</h4>
              <div className="category-filter-list">
                <button
                  className={`cat-filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => handleCategoryChange('all')}
                >
                  <span>সকল পণ্য</span>
                  <span className="count-tag">{products.length}</span>
                </button>
                {categories.map((c) => {
                  const count = products.filter(p => p.category === c.id || p.slug === c.slug).length;
                  return (
                    <button
                      key={c.id}
                      className={`cat-filter-btn ${selectedCategory === c.id ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(c.id)}
                    >
                      <span>{c.nameBn}</span>
                      <span className="count-tag">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="filter-group">
              <h4 className="filter-group-title">সর্বোচ্চ মূল্য: ৳{maxPrice}</h4>
              <input
                type="range"
                min="100"
                max="1000"
                step="20"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="price-range-slider"
              />
              <div className="price-range-labels">
                <span>৳১০০</span>
                <span>৳১,০০০</span>
              </div>
            </div>

            {/* In Stock Only Checkbox */}
            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                />
                <span>শুধুমাত্র স্টকে থাকা পণ্য</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="shop-content-area">
          {loading ? (
            <div className="shop-loading-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '340px' }}></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="shop-empty-state">
              <SearchX size={56} className="empty-icon" />
              <h3>কোনো পণ্য খুঁজে পাওয়া যায়নি</h3>
              <p>আপনার ফিল্টার বা সার্চ কিওয়ার্ড পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
              <button className="btn btn-primary" onClick={resetFilters}>
                সকল ফিল্টার মুছুন
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
