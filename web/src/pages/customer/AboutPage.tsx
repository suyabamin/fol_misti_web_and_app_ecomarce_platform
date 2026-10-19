import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, ShieldCheck, Leaf, Users, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      <div className="breadcrumbs">
        <Link to="/">হোম</Link>
        <span>/</span>
        <span className="current">আমাদের সম্পর্কে</span>
      </div>

      {/* Hero Section from reference image 18 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '3rem', alignItems: 'center', marginBottom: '4rem' }}>
        <div>
          <span className="badge badge-primary mb-1">আমাদের গল্প</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1rem', lineHeight: 1.2 }}>
            খাঁটি দেশি ফল ও শতবর্ষী ঐতিহ্যের মিষ্টির অনন্য ঠিকানা — ফল মিষ্টি
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            বাংলাদেশের প্রতিটি অঞ্চলের রয়েছে নিজস্ব গৌরবময় ফলের ঐতিহ্য এবং মিষ্টির সুপ্রাচীন ইতিহাস। রাজশাহীর হিমসাগর, দিনাজপুরের বেদানা লিচু, বগুড়ার ঐতিহ্যবাহী মিষ্টি দই কিংবা টাঙ্গাইলের পোড়াবাড়ির চমচম—এই খাঁটি স্বাদগুলো কোনো রাসায়নিক ভেজাল ছাড়াই মানুষের ঘরে পৌঁছে দেওয়ার লক্ষ্য নিয়ে শুরু হয়েছিল ‘ফল মিষ্টি’।
          </p>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
            আমরা সরাসরি স্থানীয় কৃষক ও শতবর্ষী মিষ্টির কারিগরদের সাথে যুক্ত হয়ে সেরা মান নিশ্চিত করি। প্রতিটি পণ্যের প্যাকেজিং করা হয় স্বাস্থ্যসম্মতভাবে, যাতে তাজা রূপেই তা আপনার খাবার টেবিলে পৌঁছায়।
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/shop" className="btn btn-primary btn-lg">পণ্যসমূহ দেখুন</Link>
            <Link to="/contact" className="btn btn-subtle btn-lg">যোগাযোগ করুন</Link>
          </div>
        </div>

        <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '4px solid #fff' }}>
          <img
            src="https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80"
            alt="বাগান থেকে খাঁটি ফল সংগ্রহ"
            style={{ width: '100%', height: '420px', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* Values Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '4rem' }}>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Leaf size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>১০০% ফরমালিন মুক্ত</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            আমরা বাগান থেকে পরিপক্ক ফল পেড়ে কোনো ধরনের বিষাক্ত কৃত্রিম রাসায়নিক ব্যবহার ছাড়া পৌঁছে দিই।
          </p>
        </div>

        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-accent-light)', color: '#855302', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Sparkles size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>খাঁটি দুধের ছানা</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            আমাদের প্রতিটি মিষ্টি ঐতিহ্যবাহী কারিগরদের তত্ত্বাবধানে খাঁটি দুধের ছানা ও মাওয়া দিয়ে তৈরি।
          </p>
        </div>

        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-success-light)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <ShieldCheck size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>ক্যাশ অন ডেলিভারি</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            পণ্য হাতে পেয়ে পুরোপুরি নিশ্চিত হয়ে মূল্য পরিশোধের শতভাগ বিশ্বস্ত সুবিধা।
          </p>
        </div>
      </div>
    </div>
  );
};
