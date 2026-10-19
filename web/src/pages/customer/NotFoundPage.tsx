import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="container" style={{ paddingTop: '6rem', paddingBottom: '8rem', textAlign: 'center', maxWidth: '560px' }}>
      <div style={{ fontSize: '4.5rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1, marginBottom: '1rem' }}>
        ৪০৪
      </div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>
        কাঙ্ক্ষিত পাতাটি পাওয়া যায়নি
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', marginBottom: '2rem' }}>
        আপনি যে লিংকটিতে প্রবেশ করতে চেয়েছেন তা সম্ভবত মুছে ফেলা হয়েছে বা ভুল ঠিকানায় প্রবেশ করেছেন।
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary btn-lg">
          <Home size={18} /> হোমপেজে ফিরুন
        </Link>
        <Link to="/shop" className="btn btn-subtle btn-lg">
          সকল পণ্য দেখুন
        </Link>
      </div>
    </div>
  );
};
