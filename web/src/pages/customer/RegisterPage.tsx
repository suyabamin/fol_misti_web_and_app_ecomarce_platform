import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('পাসওয়ার্ড দুটি মিলছে না!');
      return;
    }

    if (password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (!agreeTerms) {
      setError('অনুগ্রহ করে ব্যবহারের শর্তাবলী ও নীতিমালার সাথে একমত হন।');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, phone);
      navigate('/account');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'নিবন্ধন সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', maxWidth: '500px' }}>
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
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🥭</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
            নতুন একাউন্ট তৈরি করুন
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            ফল মিষ্টি পরিবারে আপনাকে স্বাগতম
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">আপনার পূর্ণ নাম *</label>
            <input
              type="text"
              className="form-input"
              placeholder="যেমন: তানভীর আহমেদ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">ইমেইল ঠিকানা *</label>
            <input
              type="email"
              className="form-input"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">মোবাইল নম্বর</label>
            <input
              type="tel"
              className="form-input"
              placeholder="017XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">পাসওয়ার্ড *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="কমপক্ষে ৬ অক্ষর"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">পাসওয়ার্ড নিশ্চিত করুন *</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="পুনরায় পাসওয়ার্ড লিখুন"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ margin: '1rem 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>আমি ব্যবহারের <Link to="/terms" style={{ color: 'var(--color-primary)' }}>শর্তাবলী</Link> ও <Link to="/privacy-policy" style={{ color: 'var(--color-primary)' }}>গোপনীয়তা নীতি</Link> মেনে নিচ্ছি।</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', height: '48px' }}
            disabled={loading}
          >
            {loading ? 'একাউন্ট তৈরি হচ্ছে...' : 'নিবন্ধন করুন'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          ইতিমধ্যে একাউন্ট আছে?{' '}
          <Link to="/login" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
            লগইন করুন
          </Link>
        </div>
      </div>
    </div>
  );
};
