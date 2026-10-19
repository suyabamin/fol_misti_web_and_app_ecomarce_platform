import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await resetPassword(email.trim());
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'পাসওয়ার্ড রিসেট লিংক পাঠাতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '4rem', paddingBottom: '6rem', maxWidth: '460px' }}>
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
            পাসওয়ার্ড ভুলে গেছেন?
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            আপনার নিবন্ধিত ইমেইল ঠিকানাটি লিখুন। আমরা আপনাকে পাসওয়ার্ড পুনরায় সেট করার লিংক পাঠিয়ে দেব।
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--color-danger-light)',
              color: 'var(--color-danger)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem'
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={48} color="var(--color-success)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>রিসেট লিংক পাঠানো হয়েছে!</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              <strong>{email}</strong> ঠিকানায় পাসওয়ার্ড রিসেটের নির্দেশনা পাঠানো হয়েছে। আপনার ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              লগইন পেজে ফিরে যান
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">ইমেইল ঠিকানা</label>
              <input
                type="email"
                className="form-input"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1rem', height: '48px' }}
              disabled={loading}
            >
              {loading ? 'পাঠানো হচ্ছে...' : 'রিসেট লিংক পাঠান'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                <ArrowLeft size={16} /> লগইনে ফিরে যান
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
