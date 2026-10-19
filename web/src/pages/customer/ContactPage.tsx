import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
      setSent(false);
    }, 4000);
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      <div className="breadcrumbs">
        <Link to="/">হোম</Link>
        <span>/</span>
        <span className="current">যোগাযোগ</span>
      </div>

      <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          আমাদের সাথে যোগাযোগ করুন
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem' }}>
          যেকোনো প্রশ্ন, কর্পোরেট মিষ্টির অর্ডার বা পরামর্শের জন্য আমাদের মেসেজ পাঠান বা কল করুন।
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '3rem', alignItems: 'start' }}>
        {/* Left Contact Details from reference 19 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Phone size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>হটলাইন সাপোর্ট</h3>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>প্রতিদিন সকাল ৯টা থেকে রাত ১০টা</p>
              <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)', display: 'block', marginTop: '0.35rem' }}>
                +880 1712-345678
              </strong>
            </div>
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Mail size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>ইমেইল</h3>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>যেকোনো লিখিত অনুসন্ধান বা ফিডব্যাক</p>
              <strong style={{ fontSize: '1.05rem', color: 'var(--color-primary)', display: 'block', marginTop: '0.35rem' }}>
                support@folmishti.com
              </strong>
            </div>
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>প্রধান কার্যালয় ও হাব</h3>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                বাড়ি ১২, রোড ৭, সেক্টর ৩, উত্তরা, ঢাকা-১২৩০, বাংলাদেশ।
              </p>
            </div>
          </div>
        </div>

        {/* Right Contact Form */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>মেসেজ পাঠান</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            নিচের ফর্মটি পূরণ করুন, আমাদের সাপোর্ট টিম দ্রুত আপনার সাথে যোগাযোগ করবে।
          </p>

          {sent && (
            <div style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>
              <CheckCircle2 size={18} /> আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে! ধন্যবাদ।
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">আপনার নাম *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="পূর্ণ নাম"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">ইমেইল ঠিকানা</label>
              <input
                type="email"
                className="form-input"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">বিষয়</label>
              <input
                type="text"
                className="form-input"
                placeholder="যেমন: পাইকারি মিষ্টির অর্ডার বা ডেলিভারি জিজ্ঞাসা"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">বার্তা / মেসেজ *</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="আপনার জিজ্ঞাসা বিস্তারিত লিখুন..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', height: '48px', gap: '0.5rem' }}>
              <Send size={18} />
              <span>মেসেজ পাঠান</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
