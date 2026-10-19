import React, { useState } from 'react';
import { Palette, CheckCircle2, Eye, RotateCcw, Sparkles, Send, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ThemeId } from '../../models';

interface ThemeDefinition {
  id: ThemeId;
  nameBn: string;
  nameEng: string;
  description: string;
  colors: {
    primary: string;
    accent: string;
    bg: string;
  };
}

const THEMES: ThemeDefinition[] = [
  {
    id: 'default',
    nameBn: 'ডিফল্ট ফল মিষ্টি থিম',
    nameEng: 'Fol Mishti Signature',
    description: 'স্বাক্ষর বন সবুজ (#156b3c) ও সোনালী হলুদ অ্যাকসেন্ট। বছরের যেকোনো সময়ের জন্য উপযুক্ত।',
    colors: { primary: '#156b3c', accent: '#fab818', bg: '#fbfbfa' }
  },
  {
    id: 'mango',
    nameBn: 'আমের সিজন (Mango Season)',
    nameEng: 'Mango Season',
    description: 'রাজশাহীর পাকা আমের উজ্জ্বল সোনালী হলুদ (#f59e0b) ও তাজা পাতার সবুজ অ্যাকসেন্ট।',
    colors: { primary: '#f59e0b', accent: '#10b981', bg: '#fffdf5' }
  },
  {
    id: 'orange',
    nameBn: 'কমলা সিজন (Orange Season)',
    nameEng: 'Citrus Orange',
    description: 'সিলেটের রসালো মিষ্টি কমলার গাঢ় সাইট্রাস অরেঞ্জ (#ea580c), ক্রিমের পরশ ও সবুজ।',
    colors: { primary: '#ea580c', accent: '#16a34a', bg: '#fffbf7' }
  },
  {
    id: 'lychee',
    nameBn: 'লিচু সিজন (Lychee Season)',
    nameEng: 'Lychee Crimson',
    description: 'দিনাজপুরের মিষ্টি বেদানা লিচুর গোলাপী-লাল (#e11d48) ও কমপ্লিমেন্টারি পাতা সবুজ।',
    colors: { primary: '#e11d48', accent: '#059669', bg: '#fff8f8' }
  },
  {
    id: 'mishti',
    nameBn: 'ঐতিহ্যবাহী মিষ্টি থিম (Mishti Festival)',
    nameEng: 'Royal Mishti Maroon',
    description: 'বিয়ে, ঈদ, পূজা ও উৎসবের জন্য রাজকীয় মেরুন (#881337), ঘন দুধের ক্রিম ও গোল্ডেন সিরাপ।',
    colors: { primary: '#881337', accent: '#d97706', bg: '#fdfaf6' }
  }
];

export const AdminAppearancePage: React.FC = () => {
  const { activeTheme, themeSettings, publishTheme, previewTheme, resetPreview } = useTheme();
  const { currentUser } = useAuth();

  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>(activeTheme);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSelectTheme = (id: ThemeId) => {
    setSelectedThemeId(id);
    previewTheme(id);
  };

  const handleConfirmPublish = async () => {
    setPublishing(true);
    try {
      await publishTheme(selectedThemeId, currentUser?.uid || 'admin-master');
      setShowConfirmModal(false);
      setSuccessMessage(`"${THEMES.find(t => t.id === selectedThemeId)?.nameBn}" সফলভাবে সমগ্র ওয়েবসাইটে প্রকাশিত হয়েছে!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert('থিম প্রকাশ করতে সমস্যা হয়েছে।');
    } finally {
      setPublishing(false);
    }
  };

  const handleResetDefault = async () => {
    setSelectedThemeId('default');
    previewTheme('default');
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
          থিম ও চেহারা সেটিংস (Appearance & Seasonal Themes)
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          মৌসুমি ফল বা উৎসব অনুযায়ী সমগ্র গ্রাহক ওয়েবসাইটের গ্লোবাল থিম পরিবর্তন ও প্রকাশ করুন
        </p>
      </div>

      {successMessage && (
        <div style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', fontWeight: 600 }}>
          <CheckCircle2 size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Active Theme Status Card */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem', boxShadow: 'var(--shadow-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block' }}>বর্তমানে লাইভ সক্রিয় থিম:</span>
          <strong style={{ fontSize: '1.3rem', color: 'var(--color-primary)' }}>
            {THEMES.find(t => t.id === activeTheme)?.nameBn} ({activeTheme.toUpperCase()})
          </strong>
          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            সর্বশেষ আপডেট: {themeSettings?.updatedAt ? new Date(themeSettings.updatedAt).toLocaleString('bn-BD') : 'স্বাভাবিক'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleResetDefault} className="btn btn-subtle btn-sm">
            <RotateCcw size={14} /> ডিফল্ট থিমে রিসেট
          </button>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="btn btn-primary"
            disabled={selectedThemeId === activeTheme && !showConfirmModal}
          >
            <Send size={16} /> এই থিমটি পাবলিশ করুন
          </button>
        </div>
      </div>

      {/* Themes Selection Cards Grid */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
        উপলব্ধ থিমসমূহ (নির্বাচন করে লাইভ প্রিভিউ দেখুন):
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {THEMES.map((t) => {
          const isSelected = selectedThemeId === t.id;
          const isCurrentlyActive = activeTheme === t.id;

          return (
            <div
              key={t.id}
              onClick={() => handleSelectTheme(t.id)}
              style={{
                background: '#fff',
                border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                boxShadow: isSelected ? 'var(--shadow-lg)' : 'var(--shadow-card)'
              }}
            >
              {isCurrentlyActive && (
                <span className="badge badge-success" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                  লাইভ
                </span>
              )}

              {/* Color Swatch palette preview */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: t.colors.primary, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: t.colors.accent, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}></div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: t.colors.bg, border: '1px solid #ddd' }}></div>
              </div>

              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem', color: isSelected ? 'var(--color-primary)' : 'var(--color-text)' }}>
                {t.nameBn}
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.75rem' }}>
                {t.nameEng}
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {t.description}
              </p>

              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>{isSelected ? '✓ প্রিভিউ চালু আছে' : 'প্রিভিউ দেখতে ক্লিক করুন'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Component Preview Showcase */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Eye size={20} className="text-primary" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
            নির্বাচিত থিমের সরাসরি উপাদান প্রিভিউ (Live Component Preview)
          </h3>
        </div>

        {/* Mock Banner */}
        <div style={{ background: 'var(--color-primary)', color: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge" style={{ background: 'var(--color-accent)', color: '#1e2922', fontWeight: 700, marginBottom: '0.5rem' }}>
              সিজনাল স্পেশাল কালেকশন
            </span>
            <h2 style={{ fontSize: '1.6rem', margin: '0.35rem 0', color: '#fff' }}>
              {selectedThemeId === 'mango' ? 'রসালো রাজশাহীর হিমসাগর ও আম্রপালি উৎসব' :
               selectedThemeId === 'orange' ? 'সিলেটের পাহাড়ি মিষ্টি কমলার তাজা সমাহার' :
               selectedThemeId === 'lychee' ? 'দিনাজপুরের বিখ্যাত রসালো বেদানা লিচু' :
               selectedThemeId === 'mishti' ? 'শতবর্ষী খাঁটি ছানার মিষ্টি ও বগুড়ার দই' :
               'খাঁটি ফল ও মিষ্টির অনন্য সমাহার'}
            </h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
              ওয়েবসাইটের রঙ, ব্যানার, বাটন ও হাইলাইট এই থিম অনুযায়ী প্রদর্শিত হবে।
            </p>
          </div>

          <button className="btn btn-accent btn-lg" style={{ boxShadow: 'var(--shadow-md)' }}>
            <ShoppingBag size={18} /> এখনই কিনুন
          </button>
        </div>

        {/* Buttons & Badges Row */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary">প্রাইমারি বাটন</button>
          <button className="btn btn-secondary">সেকেন্ডারি বাটন</button>
          <button className="btn btn-outline">আউটলাইন বাটন</button>
          <span className="badge badge-primary">প্রাইমারি ব্যাজ</span>
          <span className="badge badge-accent">অ্যাকসেন্ট ব্যাজ</span>
        </div>
      </div>

      {/* Confirmation Publish Modal */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" style={{ maxWidth: '480px', padding: '2rem', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Palette size={32} />
            </div>

            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>
              আপনি কি এই থিমটি লাইভ ওয়েবসাইটে প্রকাশ করতে চান?
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
              <strong>{THEMES.find(t => t.id === selectedThemeId)?.nameBn}</strong> থিমটি সকল গ্রাহকের ব্রাউজারে অবিলম্বে পরিবর্তিত ও কার্যকর হবে।
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setShowConfirmModal(false)} className="btn btn-subtle">
                বাতিল করুন
              </button>
              <button onClick={handleConfirmPublish} className="btn btn-primary" disabled={publishing}>
                {publishing ? 'প্রকাশ হচ্ছে...' : 'হ্যাঁ, পাবলিশ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
