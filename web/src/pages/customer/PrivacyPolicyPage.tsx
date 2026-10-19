import React from 'react';
import { Link } from 'react-router-dom';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem', maxWidth: '850px' }}>
      <div className="breadcrumbs">
        <Link to="/">হোম</Link>
        <span>/</span>
        <span className="current">প্রাইভেসি পলিসি</span>
      </div>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', boxShadow: 'var(--shadow-card)' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
          গোপনীয়তা ও প্রাইভেসী পলিসি
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
          সর্বশেষ আপডেট: অক্টোবর ২০২৬
        </p>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>১. তথ্য সংগ্রহ ও ব্যবহার</h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            ফল মিষ্টি (Fol Mishti) গ্রাহকদের গোপনীয়তাকে সর্বোচ্চ গুরুত্ব দিয়ে থাকে। আপনার নাম, মোবাইল নম্বর এবং ডেলিভারি ঠিকানা শুধুমাত্র আপনার অর্ডার যথাযথভাবে প্রক্রিয়াকরণ ও পৌঁছে দেওয়ার কাজে ব্যবহৃত হয়।
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>২. তথ্যের নিরাপত্তা</h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            আমরা গ্রাহকদের কোনো ব্যক্তিগত তথ্য বা ফোন নম্বর কোনো তৃতীয় পক্ষের কাছে বিক্রি বা বিপণনের উদ্দেশ্যে উন্মুক্ত করি না। আমাদের সার্ভারে সংরক্ষিত পাসওয়ার্ড বা সংবেদনশীল তথ্য সর্বদা উচ্চমাত্রার এনক্রিপশনের মাধ্যমে সুরক্ষিত থাকে।
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>৩. কুকিজ ও সেশন</h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            গ্রাহকের কার্ট আইটেম সংরক্ষণ এবং নিরবচ্ছিন্ন ব্রাউজিং অভিজ্ঞতার জন্য আমরা ব্রাউজার কুকিজ ব্যবহার করি।
          </p>
        </section>
      </div>
    </div>
  );
};
