import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, Clock, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deliveryRepository } from '../../repositories/deliveryRepository';
import { DeliveryProfile, DeliverySchedule } from '../../models';

interface ContextType {
  profile: DeliveryProfile | null;
  reloadProfile: () => void;
}

const DAYS_OF_WEEK = [
  { id: 0, nameBn: 'রবিবার', nameEn: 'Sun' },
  { id: 1, nameBn: 'সোমবার', nameEn: 'Mon' },
  { id: 2, nameBn: 'মঙ্গলবার', nameEn: 'Tue' },
  { id: 3, nameBn: 'বুধবার', nameEn: 'Wed' },
  { id: 4, nameBn: 'বৃহস্পতিবার', nameEn: 'Thu' },
  { id: 5, nameBn: 'শুক্রবার', nameEn: 'Fri' },
  { id: 6, nameBn: 'শনিবার', nameEn: 'Sat' }
];

export const DeliverySchedulePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { profile, reloadProfile } = useOutletContext<ContextType>();

  const currentSchedule: DeliverySchedule = profile?.schedule || {
    workingDays: [0, 1, 2, 3, 4, 5, 6],
    startTime: '09:00',
    endTime: '19:00',
    breakStartTime: '13:00',
    breakEndTime: '14:00',
    isLeaveToday: false,
    maxActiveDeliveries: 2
  };

  const [workingDays, setWorkingDays] = useState<number[]>(currentSchedule.workingDays || []);
  const [startTime, setStartTime] = useState(currentSchedule.startTime || '09:00');
  const [endTime, setEndTime] = useState(currentSchedule.endTime || '19:00');
  const [breakStartTime, setBreakStartTime] = useState(currentSchedule.breakStartTime || '13:00');
  const [breakEndTime, setBreakEndTime] = useState(currentSchedule.breakEndTime || '14:00');
  const [isLeaveToday, setIsLeaveToday] = useState(Boolean(currentSchedule.isLeaveToday));
  const [maxActiveDeliveries, setMaxActiveDeliveries] = useState(currentSchedule.maxActiveDeliveries || 2);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const toggleDay = (dayId: number) => {
    if (workingDays.includes(dayId)) {
      setWorkingDays(workingDays.filter(d => d !== dayId));
    } else {
      setWorkingDays([...workingDays, dayId].sort());
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid) return;

    if (workingDays.length === 0 && !isLeaveToday) {
      setMessage({ text: 'কমপক্ষে একটি কর্মদিবস নির্বাচন করুন।', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const updatedSchedule: DeliverySchedule = {
      workingDays,
      startTime,
      endTime,
      breakStartTime,
      breakEndTime,
      isLeaveToday,
      maxActiveDeliveries: Number(maxActiveDeliveries)
    };

    try {
      await deliveryRepository.updateSchedule(currentUser.uid, updatedSchedule);
      // Also sync availability if on leave
      if (isLeaveToday) {
        await deliveryRepository.updateAvailability(currentUser.uid, 'unavailable');
      }
      reloadProfile();
      setMessage({ text: 'আপনার শিডিউল সফলভাবে সংরক্ষিত হয়েছে!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'শিডিউল সংরক্ষণ করতে সমস্যা হয়েছে।', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
          ডেলিভারি শিডিউল ও সময়সূচী 📅
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          আপনার কাজের দিন, কর্মঘণ্টা ও ছুটির শিডিউল নির্ধারণ করুন
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: message.type === 'success' ? 'var(--color-primary-light)' : 'var(--color-danger-light)',
            color: message.type === 'success' ? 'var(--color-primary)' : 'var(--color-danger)',
            fontWeight: 600
          }}
        >
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        {/* On Leave Today Switch */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isLeaveToday ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-surface-subtle)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', border: '1px solid var(--color-border)' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: isLeaveToday ? 'var(--color-danger)' : 'var(--color-text)' }}>
              আজকের দিনে ছুটিতে আছেন?
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              চালু করলে আজ কোনো নতুন অর্ডার আপনার নামে অ্যাসাইন করা হবে না
            </div>
          </div>
          <input
            type="checkbox"
            checked={isLeaveToday}
            onChange={(e) => setIsLeaveToday(e.target.checked)}
            style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: 'var(--color-danger)' }}
          />
        </div>

        {/* Working Days */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--color-text)' }}>
            সাপ্তাহিক কর্মদিবস (Working Days)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '0.5rem' }}>
            {DAYS_OF_WEEK.map((d) => {
              const isSelected = workingDays.includes(d.id);
              return (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => toggleDay(d.id)}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface-subtle)',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                >
                  <div>{d.nameBn}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{d.nameEn}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Working Hours */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--color-text)' }}>
              শিফট শুরুর সময়
            </label>
            <input
              type="time"
              className="form-input"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--color-text)' }}>
              শিফট সমাপ্তির সময়
            </label>
            <input
              type="time"
              className="form-input"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Break Hours */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--color-text)' }}>
              বিরতি শুরু (Lunch/Break)
            </label>
            <input
              type="time"
              className="form-input"
              value={breakStartTime}
              onChange={(e) => setBreakStartTime(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--color-text)' }}>
              বিরতি শেষ
            </label>
            <input
              type="time"
              className="form-input"
              value={breakEndTime}
              onChange={(e) => setBreakEndTime(e.target.value)}
            />
          </div>
        </div>

        {/* Max Active Deliveries */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--color-text)' }}>
            একসাথে সর্বোচ্চ চলমান ডেলিভারি (Workload Limit)
          </label>
          <select
            className="form-select"
            value={maxActiveDeliveries}
            onChange={(e) => setMaxActiveDeliveries(Number(e.target.value))}
          >
            <option value={1}>১ টি অর্ডার (সাধারণ)</option>
            <option value={2}>২ টি অর্ডার (স্ট্যান্ডার্ড)</option>
            <option value={3}>৩ টি অর্ডার (হাই ক্যাপাসিটি)</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={saving}
          style={{ width: '100%', gap: '0.5rem', height: '48px' }}
        >
          <Save size={18} />
          <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'শিডিউল পরিবর্তন সেভ করুন'}</span>
        </button>
      </form>
    </div>
  );
};
