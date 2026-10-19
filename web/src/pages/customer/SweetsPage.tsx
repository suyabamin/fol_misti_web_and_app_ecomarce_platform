import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart } from 'lucide-react';
import { productRepository } from '../../repositories/productRepository';
import { Product } from '../../models';
import { ProductCard } from '../../components/ProductCard';

export const SweetsPage: React.FC = () => {
  const [sweets, setSweets] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSweets() {
      try {
        const all = await productRepository.getAll();
        setSweets(all.filter(p => p.category === 'sweets' || p.category === 'sweet-boxes'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSweets();
  }, []);

  return (
    <div className="sweets-page container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      {/* Breadcrumb */}
      <div className="breadcrumbs">
        <Link to="/">হোম</Link>
        <span>/</span>
        <span className="current">ঐতিহ্যবাহী মিষ্টি</span>
      </div>

      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #881337 0%, #4c0519 100%)',
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
        <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>
          <Sparkles size={14} /> শতবর্ষী ঐতিহ্য ও খাঁটি স্বাদ
        </span>
        <h1 style={{ fontSize: '2.4rem', color: '#fff', margin: 0 }}>
          খাঁটি ছানা ও গাভীর দুধে তৈরি বাংলার আদি মিষ্টি
        </h1>
        <p style={{ maxWidth: '650px', fontSize: '1.05rem', opacity: 0.9 }}>
          বগুড়ার প্রসিদ্ধ মিষ্টি দই, টাঙ্গাইলের পোড়াবাড়ির চমচম, নাটোরের কাঁচাগোল্লা ও নরম তুলতুলে স্পঞ্জ রসগোল্লা। উৎসব কিংবা অতিথি আপ্যায়নে সেরা পছন্দ।
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="products-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '340px' }}></div>
          ))}
        </div>
      ) : (
        <div className="products-grid">
          {sweets.map(sweet => (
            <ProductCard key={sweet.id} product={sweet} />
          ))}
        </div>
      )}
    </div>
  );
};
