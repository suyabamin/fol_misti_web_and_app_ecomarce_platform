import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react';

export const ReturnRefundPage: React.FC = () => {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem', maxWidth: '850px' }}>
      <div className="breadcrumbs">
        <Link to="/">হোম</Link>
        <span>/</span>
        <span className="current">রিটার্ন ও রিফান্ড পলিসি</span>
      </div>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', boxShadow: 'var(--shadow-card)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
          রিটার্ন ও রিফান্ড পলিসি
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          সর্বশেষ আপডেট: অক্টোবর ২০২৬
        </p>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--color-text)' }}>১. পচনশীল পণ্যের ক্ষেত্রে রিটার্ন শর্ত</h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            যেহেতু ফল ও ঐতিহ্যবাহী মিষ্টি পচনশীল ও প্রাকৃতিক খাদ্যপণ্য, তাই গ্রাহকদের অনুরোধ করা হচ্ছে ডেলিভারি ম্যানের উপস্থিতিতে পণ্য পরীক্ষা করে গ্রহণ করার জন্য।
          </p>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
            <li>পণ্য পচা, অতিরিক্ত নরম, বিনষ্ট বা প্যাকেজিং ক্ষতিগ্রস্ত থাকলে তাৎক্ষণিকভাবে ডেলিভারি ম্যানের কাছে ফেরত দেওয়া যাবে।</li>
            <li>ডেলিভারি ম্যান চলে যাওয়ার পর কোনো সমস্যা দেখা দিলে ডেলিভারির ২৪ ঘণ্টার মধ্যে ছবিসহ আমাদের হটলাইনে (০১৭১২-৩৪৫৬৭৮) বা লাইভ চ্যাটে জানাতে হবে।</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--color-text)' }}>২. রিফান্ড পদ্ধতি</h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            যেসব ক্ষেত্রে অগ্রিম পেমেন্ট বা রিটার্ন প্রযোজ্য হয়, সেক্ষেত্রে ৩ থেকে ৫ কার্যদিবসের মধ্যে গ্রাহকের বিকাশ, নগদ বা ব্যাংক একাউন্টে রিফান্ড সম্পন্ন করা হয়। ক্যাশ অন ডেলিভারির ক্ষেত্রে কোনো পেমেন্ট নেওয়ার আগেই পণ্য পরিবর্তন করে দেওয়া হয়।
          </p>
        </section>
      </div>
    </div>
  );
};
