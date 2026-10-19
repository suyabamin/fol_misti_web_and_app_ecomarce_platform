import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

export const FaqPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      q: 'ফল মিষ্টিতে কীভাবে অর্ডার করবেন?',
      a: 'পছন্দের ফল বা মিষ্টি কার্টে যুক্ত করুন। এরপর চেকআউট পেজে গিয়ে আপনার নাম, ডেলিভারি ঠিকানা ও মোবাইল নম্বর প্রদান করে "অর্ডার নিশ্চিত করুন" বাটনে ক্লিক করুন। কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই।'
    },
    {
      q: 'ঢাকার ভেতরে এবং বাইরে ডেলিভারি পেতে কত সময় লাগে?',
      a: 'ঢাকার ভেতরের যেকোনো এলাকায় অর্ডার করার ১২ থেকে ২৪ ঘণ্টার মধ্যে ডেলিভারি সম্পন্ন হয়। ঢাকার বাইরে সমগ্র বাংলাদেশের যেকোনো জেলা শহরে ৪৮ থেকে ৭২ ঘণ্টার মধ্যে নিরাপদে পণ্য পৌঁছে দেওয়া হয়।'
    },
    {
      q: 'ক্যাশ অন ডেলিভারি (COD) কি সব জেলায় প্রযোজ্য?',
      a: 'হ্যাঁ, ফল মিষ্টির পক্ষ থেকে সমগ্র বাংলাদেশের যেকোনো ঠিকানায় সম্পূর্ণ ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। পণ্য হাতে পেয়ে চেক করে ডেলিভারিম্যানকে মূল্য পরিশোধ করতে পারবেন।'
    },
    {
      q: 'ফলগুলো কি সম্পূর্ণ ফরমালিন ও কেমিক্যাল মুক্ত?',
      a: 'অবশ্যই। আমরা রাজশাহী, নওগাঁ, দিনাজপুর ও মধুপুরের চুক্তিবদ্ধ বাগান থেকে সরাসরি পরিপক্ক ফল সংগ্রহ করি। কোনো প্রকার বিষাক্ত কৃত্রিম রাসায়নিক বা কার্বাইড ব্যবহার করা হয় না।'
    },
    {
      q: 'মিষ্টি কীভাবে তাজা রাখা হয় এবং প্যাকেজিং কেমন?',
      a: 'ঐতিহ্যবাহী মিষ্টিগুলো প্রতিদিন ভোরে খাঁটি দুধের ছানা দিয়ে তৈরি হয় এবং খাদ্য-নিরাপদ বিশেষ ফুড-গ্রেড বক্সে প্যাক করা হয় যাতে জার্নিতে কোনো ক্ষতি না হয়।'
    },
    {
      q: 'পণ্য নষ্ট বা ক্ষতিগ্রস্ত অবস্থায় পেলে কী করণীয়?',
      a: 'ডেলিভারি নেওয়ার সময় কোনো পণ্য নষ্ট বা ভাঙা পেলে সাথে সাথে ডেলিভারিম্যানকে জানান অথবা আমাদের হটলাইন নম্বরে (০১৭১২-৩৪৫৬৭৮) কল করুন। আমরা বিনামূল্যে পণ্যটি পরিবর্তন করে দেব অথবা সম্পূর্ণ টাকা ফেরত দেব।'
    }
  ];

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem', maxWidth: '800px' }}>
      <div className="breadcrumbs">
        <Link to="/">হোম</Link>
        <span>/</span>
        <span className="current">সাধারণ জিজ্ঞাসা</span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          সচরাচর জিজ্ঞাসা (FAQ)
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem' }}>
          আমাদের সেবা, ডেলিভারি ও পণ্যের মান সম্পর্কিত সাধারণ প্রশ্ন ও উত্তর।
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                style={{
                  width: '100%',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: isOpen ? 'var(--color-primary)' : 'var(--color-text)'
                }}
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: '0 1.5rem 1.25rem',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    borderTop: '1px solid var(--color-border-subtle)',
                    paddingTop: '0.75rem'
                  }}
                >
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
