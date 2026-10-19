import React, { useState } from 'react';
import { User, Shield, CheckCircle2, Lock, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminProfilePage: React.FC = () => {
  const { currentUser, userProfile, updateUserDisplayName } = useAuth();
  const [name, setName] = useState(userProfile?.displayName || 'সুপার অ্যাডমিন');
  const [updated, setUpdated] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await updateUserDisplayName(name.trim());
      setUpdated(true);
      setTimeout(() => setUpdated(false), 3000);
    }
  };

  return (
    <div style={{ maxWidth: '650px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>অ্যাডমিন প্রোফাইল (Admin Profile)</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          আপনার সিস্টেম অ্যাকাউন্ট তথ্য ও নিরাপত্তা
        </p>
      </div>

      {updated && (
        <div style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>
          <CheckCircle2 size={18} /> প্রোফাইল সফলভাবে আপডেট হয়েছে!
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 700 }}>
            {name.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', margin: '0 0 0.25rem' }}>{name}</h2>
            <span className="badge badge-primary">
              <Shield size={12} /> সুপার অ্যাডমিনিস্ট্রেটর
            </span>
          </div>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">প্রদর্শন নাম (Display Name)</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">ইমেইল ঠিকানা</label>
            <input
              type="email"
              className="form-input"
              value={currentUser?.email || 'admin@folmishti.com'}
              disabled
            />
            <small style={{ color: 'var(--color-text-muted)' }}>অ্যাডমিন ইমেইল পরিবর্তন করতে মূল Firebase কনসোল ব্যবহার করুন।</small>
          </div>

          <div className="form-group">
            <label className="form-label">ভূমিকা (Role)</label>
            <input
              type="text"
              className="form-input"
              value="Super Administrator (Full Access)"
              disabled
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            পরিবর্তন সংরক্ষণ করুন
          </button>
        </form>
      </div>
    </div>
  );
};
