import React, { useEffect, useState } from 'react';
import { Save, CheckCircle2, Store, Phone, Mail, MapPin, Truck, AlertTriangle } from 'lucide-react';
import { settingsRepository } from '../../repositories/settingsRepository';
import { StoreSettings } from '../../models';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await settingsRepository.getStoreSettings();
      setSettings(data);
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    await settingsRepository.updateStoreSettings(settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!settings) {
    return <div>সেটিংস লোড হচ্ছে...</div>;
  }

  return (
    <div style={{ maxWidth: '850px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>স্টোর সেটিংস (Store Settings)</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          দোকানের নাম, যোগাযোগের ঠিকানা, ডেলিভারি চার্জ ও সার্বিক কনফিগারেশন
        </p>
      </div>

      {saved && (
        <div style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>
          <CheckCircle2 size={18} /> সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-card)' }}>
        {/* Brand Names */}
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.5rem' }}>
          ব্র্যান্ড তথ্য
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">দোকানের বাংলা নাম</label>
            <input
              type="text"
              className="form-input"
              value={settings.storeNameBn}
              onChange={(e) => setSettings({ ...settings, storeNameBn: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">ইংরেজি নাম</label>
            <input
              type="text"
              className="form-input"
              value={settings.storeName}
              onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Contact info */}
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.5rem' }}>
          যোগাযোগ ও ঠিকানা
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">হটলাইন মোবাইল নম্বর</label>
            <input
              type="text"
              className="form-input"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">ইমেইল ঠিকানা</label>
            <input
              type="email"
              className="form-input"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">অফিস ও হাবের বিস্তারিত ঠিকানা</label>
          <input
            type="text"
            className="form-input"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            required
          />
        </div>

        {/* Delivery Rules */}
        <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '0.5rem' }}>
          ডিফল্ট ডেলিভারি চার্জ
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">ঢাকার ভেতরে চার্জ (৳)</label>
            <input
              type="number"
              className="form-input"
              value={settings.deliveryFeeInsideDhaka}
              onChange={(e) => setSettings({ ...settings, deliveryFeeInsideDhaka: Number(e.target.value) })}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">ঢাকার বাইরে চার্জ (৳)</label>
            <input
              type="number"
              className="form-input"
              value={settings.deliveryFeeOutsideDhaka}
              onChange={(e) => setSettings({ ...settings, deliveryFeeOutsideDhaka: Number(e.target.value) })}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">ফ্রি ডেলিভারি থ্রেশহোল্ড (৳)</label>
            <input
              type="number"
              className="form-input"
              value={settings.freeDeliveryThreshold}
              onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })}
              required
            />
          </div>
        </div>

        {/* Maintenance Toggle */}
        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
            <input
              type="checkbox"
              checked={settings.isMaintenanceMode}
              onChange={(e) => setSettings({ ...settings, isMaintenanceMode: e.target.checked })}
            />
            <strong>স্টোর মেইনটেন্যান্স মোড (Maintenance Mode)</strong>
          </label>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={saving} style={{ gap: '0.5rem' }}>
          <Save size={18} />
          <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন'}</span>
        </button>
      </form>
    </div>
  );
};
