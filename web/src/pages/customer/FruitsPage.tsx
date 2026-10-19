import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Truck, Leaf } from 'lucide-react';
import { productRepository } from '../../repositories/productRepository';
import { Product } from '../../models';
import { ProductCard } from '../../components/ProductCard';

export const FruitsPage: React.FC = () => {
  const [fruits, setFruits] = useState<Product[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFruits() {
      try {
        const all = await productRepository.getAll();
        setFruits(all.filter(p => p.category === 'fruits' || p.category === 'mango-collection'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFruits();
  }, []);

  const displayedFruits = fruits.filter(p => {
    if (filterType === 'mango') return p.seasonType === 'mango';
    if (filterType === 'lychee') return p.seasonType === 'lychee';
    if (filterType === 'other') return p.seasonType !== 'mango' && p.seasonType !== 'lychee';
    return true;
  });

  return (
    <div className="fruits-page container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      {/* Breadcrumb */}
      <div className="breadcrumbs">
        <Link to="/">হোম</Link>
        <span>/</span>
        <span className="current">তাজা মৌসুমি ফল</span>
      </div>

      {/* Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          color: '#fff',
          marginBottom: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '0.75rem',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <span className="badge" style={{ background: '#fef08a', color: '#855302' }}>
          <Leaf size={14} /> ১০০% ফরমালিন ও কেমিক্যাল মুক্ত
        </span>
        <h1 style={{ fontSize: '2.4rem', color: '#fff', margin: 0 }}>
          বাগান থেকে সরাসরি টাটকা মৌসুমি ফল
        </h1>
        <p style={{ maxWidth: '650px', fontSize: '1.05rem', opacity: 0.9 }}>
          রাজশাহীর হিমসাগর, নওগাঁর আম্রপালি ও দিনাজপুরের বিখ্যাত বেদানা লিচু। পরিপক্ক অবস্থায় গাছ থেকে পেড়ে সরাসরি আপনার ঠিকানায় পৌঁছে দিচ্ছি।
        </p>
      </div>

      {/* Fruit Category Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'সকল ফল' },
          { id: 'mango', label: 'আমের স্পেশাল (Mangoes)' },
          { id: 'lychee', label: 'রসালো লিচু (Lychees)' },
          { id: 'other', label: 'অন্যান্য ফল (Dragon, Malta, Pineapple)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`btn ${filterType === tab.id ? 'btn-primary' : 'btn-subtle'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="products-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '340px' }}></div>
          ))}
        </div>
      ) : (
        <div className="products-grid">
          {displayedFruits.map(fruit => (
            <ProductCard key={fruit.id} product={fruit} />
          ))}
        </div>
      )}
    </div>
  );
};
