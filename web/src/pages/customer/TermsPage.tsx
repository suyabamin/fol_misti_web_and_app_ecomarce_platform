import React from 'react';
import { Link } from 'react-router-dom';

export const TermsPage: React.FC = () => {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem', maxWidth: '850px' }}>
      <div className="breadcrumbs">
        <Link to="/">হোম</Link>
        <span>/</span>
        <span className="current">শর্তাবলী</span>
      </div>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', boxShadow: 'var(--shadow-card)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
          ব্যবহারের সাধারণ শর্তাবলী
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          সর্বশেষ আপডেট: অক্টোবর ২০২৬
        </p>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>১. ভূমিকা</h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            ‘ফল মিষ্টি’ (folmishti.com) ওয়েবসাইট ব্যবহারের মাধ্যমে আপনি এই সকল সাধারণ শর্তাবলীর সাথে সম্মতি জ্ঞাপন করছেন।
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>২. পণ্যের মূল্য ও স্টক</h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            মৌসুমি ফল ও মিষ্টির মূল্য বাজার পরিস্থিতি ও সরবরাহের ওপর ভিত্তি করে যেকোনো সময় পরিবর্তিত হতে পারে। ওয়েবসাইটে প্রদর্শিত মূল্য চূড়ান্ত বলে গণ্য হবে। কোনো কারণে অপ্রত্যাশিতভাবে স্টক শেষ হলে কর্তৃপক্ষ অর্ডার বাতিল বা সমন্বয় করার অধিকার সংরক্ষণ করে।
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>৩. অর্ডার নিশ্চিতকরণ ও পেমেন্ট</h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            ক্যাশ অন ডেলিভারিতে অর্ডার করার পর গ্রাহকের ফোন নম্বরে কনফার্মেশন যাচাই করা হতে পারে। অসত্য বা ভুয়া তথ্যের ভিত্তিতে অর্ডার বাতিল করার অধিকার ফল মিষ্টি টিমের রয়েছে।
          </p>
        </section>
      </div>
    </div>
  );
};
