import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const profile = await login(email, password);
      if (profile.role === 'admin' || email === 'admin@folmishti.com') {
        navigate('/admin');
      } else if (profile.role === 'delivery' || email === 'delivery@folmishti.com') {
        navigate('/delivery');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError(null);
    setLoading(true);
    try {
      const profile = await login(demoEmail, 'Password123!');
      if (profile.role === 'admin' || demoEmail === 'admin@folmishti.com') {
        navigate('/admin');
      } else if (profile.role === 'delivery' || demoEmail === 'delivery@folmishti.com') {
        navigate('/delivery');
      } else {
        navigate('/account');
      }
    } catch (err: any) {
      setError(err.message || 'লগইন ত্রুটি');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'গুগল সাইন-ইন সম্পন্ন করা যায়নি।');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '3.5rem', paddingBottom: '5rem', maxWidth: '480px' }}>
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
            আপনার একাউন্টে লগইন করুন
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            ফল মিষ্টির সাথে কেনাকাটা আরও সহজ ও উপভোগ্য করুন
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
            <label className="form-label">ইমেইল ঠিকানা</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">পাসওয়ার্ড</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>
                পাসওয়ার্ড ভুলে গেছেন?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
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

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1rem', height: '48px' }}
            disabled={loading}
          >
            {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
          </button>
        </form>

        <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
          <span>অথবা</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="btn btn-subtle"
          style={{ width: '100%', height: '46px', gap: '0.75rem', fontWeight: 600 }}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            style={{ width: '18px', height: '18px' }}
          />
          <span>Google দিয়ে সাইন ইন করুন</span>
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          নতুন গ্রাহক?{' '}
          <Link to="/register" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
            নতুন একাউন্ট খুলুন
          </Link>
        </div>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '0.5rem', textAlign: 'center' }}>
            দ্রুত টেস্টিং ডেমো একাউন্ট (১-ক্লিক লগইন):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'center' }}
              onClick={() => handleDemoLogin('admin@folmishti.com')}
            >
              🛡️ অ্যাডমিন ডেমো
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'center' }}
              onClick={() => handleDemoLogin('delivery@folmishti.com')}
            >
              🚚 ডেলিভারি রাইডার
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
