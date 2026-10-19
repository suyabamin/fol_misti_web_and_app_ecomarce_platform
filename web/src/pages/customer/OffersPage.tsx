import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Copy, Check, Clock, Sparkles } from 'lucide-react';
import { couponRepository } from '../../repositories/couponRepository';
import { Coupon } from '../../models';

export const OffersPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function loadCoupons() {
      const data = await couponRepository.getAll();
      setCoupons(data.filter(c => c.isActive));
    }
    loadCoupons();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      <div className="breadcrumbs">
        <Link to="/">হোম</Link>
        <span>/</span>
        <span className="current">অফার ও কুপন</span>
      </div>

      <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem' }}>
        <span className="badge badge-accent mb-1"><Sparkles size={14} /> বিশেষ ডিসকাউন্ট</span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0.25rem 0 0.5rem' }}>
          চলমান অফার ও প্রোমো কুপন
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem' }}>
          চেকআউটে নিচের কোডগুলো ব্যবহার করে সেরা মূল্যে কিনুন আপনার পছন্দের ফল ও মিষ্টি।
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            style={{
              background: 'var(--color-surface)',
              border: '2px dashed var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="badge badge-primary">
                  {coupon.type === 'percentage' ? `${coupon.value}% ছাড়` : `৳${coupon.value} ছাড়`}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={14} /> মেয়াদ: {coupon.validUntil}
                </span>
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--color-primary)' }}>
                {coupon.type === 'percentage' ? `সর্বোচ্চ ৳${coupon.maxDiscount || 'আনলিমিটেড'} ছাড়` : `৳${coupon.value} টাকার ক্যাশ ছাড়`}
              </h3>

              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                সর্বনিম্ন ৳{coupon.minOrderAmount} টাকার অর্ডারে এই কুপনটি প্রযোজ্য।
              </p>
            </div>

            {/* Code Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>কুপন কোড:</span>
                <strong style={{ fontSize: '1.2rem', letterSpacing: '1px', color: 'var(--color-text)' }}>
                  {coupon.code}
                </strong>
              </div>

              <button
                className={`btn ${copiedCode === coupon.code ? 'btn-primary' : 'btn-outline'} btn-sm`}
                onClick={() => handleCopy(coupon.code)}
                style={{ gap: '0.4rem' }}
              >
                {copiedCode === coupon.code ? (
                  <>
                    <Check size={16} /> কপি হয়েছে
                  </>
                ) : (
                  <>
                    <Copy size={16} /> কপি করুন
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
