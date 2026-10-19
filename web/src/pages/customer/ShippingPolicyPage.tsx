import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, Clock, MapPin } from 'lucide-react';

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem', maxWidth: '850px' }}>
      <div className="breadcrumbs">
        <Link to="/">হোম</Link>
        <span>/</span>
        <span className="current">শিপিং পলিসি</span>
      </div>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', boxShadow: 'var(--shadow-card)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
          শিপিং ও ডেলিভারি পলিসি
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          সর্বশেষ আপডেট: অক্টোবর ২০২৬
        </p>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--color-text)' }}>১. ডেলিভারি এলাকা ও সময়সীমা</h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            ফল মিষ্টি সমগ্র বাংলাদেশে দ্রুততম ডেলিভারি সেবা প্রদান করে থাকে।
          </p>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
            <li><strong>ঢাকা উত্তর ও দক্ষিণ সিটি করপোরেশন:</strong> অর্ডার নিশ্চিতকরণের ১২ থেকে ২৪ ঘণ্টার মধ্যে ডেলিভারি।</li>
            <li><strong>ঢাকা উপশহর (সাভার, গাজীপুর, কেরানীগঞ্জ, নারায়ণগঞ্জ):</strong> ২৪ থেকে ৩৬ ঘণ্টার মধ্যে।</li>
            <li><strong>সমগ্র বাংলাদেশ (অন্যান্য সকল জেলা শহর):</strong> ৪৮ থেকে ৭২ ঘণ্টার মধ্যে নিরাপদ কুরিয়ার বা স্পেশাল সার্ভিসের মাধ্যমে।</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--color-text)' }}>২. ডেলিভারি চার্জ</h3>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
            <li>ঢাকার ভেতরে ডেলিভারি চার্জ মাত্র <strong>৳৬০ টাকা</strong>।</li>
            <li>ঢাকা উপশহরে ডেলিভারি চার্জ <strong>৳৯০ টাকা</strong>।</li>
            <li>ঢাকার বাইরে সমগ্র বাংলাদেশে ডেলিভারি চার্জ <strong>৳১৩০ টাকা</strong>।</li>
            <li>৳২,০০০ টাকার অধিক মূল্যের অর্ডারে সমগ্র বাংলাদেশে সম্পূর্ণ ফ্রি ডেলিভারি প্রযোজ্য।</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--color-text)' }}>৩. তাজা ফল ও মিষ্টির বিশেষ প্যাকেজিং</h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            ফল ও মিষ্টি অত্যন্ত সংবেদনশীল খাদ্যপণ্য। আমাদের প্রতিটি অর্ডার ফুড-গ্রেড বায়ুরোধী পাত্রে এবং আম/লিচুর ক্ষেত্রে শক-প্রুফ কার্টনে পাঠানো হয় যাতে পরিবহনকালে পণ্যের কোনো গুণগত মান হ্রাস না পায়।
          </p>
        </section>
      </div>
    </div>
  );
};
