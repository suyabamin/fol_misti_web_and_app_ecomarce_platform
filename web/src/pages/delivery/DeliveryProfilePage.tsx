import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Phone, Mail, ShieldCheck, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deliveryRepository } from '../../repositories/deliveryRepository';
import { DeliveryProfile } from '../../models';

interface ContextType {
  profile: DeliveryProfile | null;
  reloadProfile: () => void;
}

export const DeliveryProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { profile, reloadProfile } = useOutletContext<ContextType>();

  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [vehicleType, setVehicleType] = useState<DeliveryProfile['vehicleType']>(profile?.vehicleType || 'motorbike');
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState(profile?.vehiclePlateNumber || '');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setSuccess(false);

    try {
      const updated: DeliveryProfile = {
        ...profile,
        name,
        phone,
        vehicleType,
        vehiclePlateNumber
      };
      await deliveryRepository.saveDeliveryProfile(updated);
      reloadProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
          রাইডার প্রোফাইল 👤
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          আপনার ব্যক্তিগত ও যানবাহনের তথ্য
        </p>
      </div>

      {success && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <CheckCircle2 size={18} />
          <span>প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        {/* Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
          <ShieldCheck size={20} />
          <span>ভেরিফাইড ডেলিভারি পার্সন একাউন্ট (সক্রিয়)</span>
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">পূর্ণ নাম</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">মোবাইল নম্বর (যোগাযোগের জন্য)</label>
          <input
            type="tel"
            className="form-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">ইমেইল (লগইন আইডি)</label>
          <input
            type="email"
            className="form-input"
            value={profile?.email || currentUser?.email || ''}
            disabled
            style={{ background: 'var(--color-surface-subtle)', cursor: 'not-allowed' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">যানবাহনের ধরন (Vehicle Type)</label>
          <select
            className="form-select"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value as any)}
          >
            <option value="motorbike">মোটরসাইকেল (Motorbike)</option>
            <option value="bicycle">বাইসাইকেল (Bicycle)</option>
            <option value="van">ডেলিভারি ভ্যান (Van)</option>
            <option value="walking">পায়ে হেঁটে (Walking)</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label className="form-label">যানবাহনের নম্বর / জোন বিবরণ</label>
          <input
            type="text"
            className="form-input"
            placeholder="যেমন: ঢাকা মেট্রো-হ ১২-৩৪৫৬ অথবা উত্তরা জোন"
            value={vehiclePlateNumber}
            onChange={(e) => setVehiclePlateNumber(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={saving}
          style={{ width: '100%', gap: '0.5rem', height: '48px' }}
        >
          <Save size={18} />
          <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'প্রোফাইল সংরক্ষণ করুন'}</span>
        </button>
      </form>
    </div>
  );
};
