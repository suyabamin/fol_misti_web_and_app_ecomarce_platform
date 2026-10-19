import React, { useEffect, useState } from 'react';
import { PlusCircle, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { bannerRepository } from '../../repositories/bannerRepository';
import { Banner } from '../../models';

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badgeText, setBadgeText] = useState('২০% পর্যন্ত বিশেষ ছাড়!');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('/shop');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  const loadBanners = async () => {
    const list = await bannerRepository.getAll();
    setBanners(list);
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    const newBanner: Banner = {
      id: `b-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim(),
      badgeText: badgeText.trim(),
      imageUrl: imageUrl.trim(),
      linkUrl: linkUrl.trim(),
      sortOrder: Number(sortOrder),
      isActive
    };

    await bannerRepository.save(newBanner);
    setIsModalOpen(false);
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    loadBanners();
  };

  const handleToggle = async (b: Banner) => {
    await bannerRepository.save({ ...b, isActive: !b.isActive });
    loadBanners();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('আপনি কি এই ব্যানারটি মুছে ফেলতে চান?')) {
      await bannerRepository.delete(id);
      loadBanners();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>ব্যানার স্লাইডার (Banners)</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            হোমপেজের প্রধান প্রোমোশনাল ব্যানার ও ক্যাম্পেইন পরিচালনা করুন
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <PlusCircle size={18} /> নতুন ব্যানার যোগ
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {banners.map((b) => (
          <div
            key={b.id}
            style={{
              background: '#fff',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ height: '160px', position: 'relative' }}>
              <img
                src={b.imageUrl}
                alt={b.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                className={`badge ${b.isActive ? 'badge-success' : 'badge-danger'}`}
                style={{ position: 'absolute', top: '10px', right: '10px' }}
              >
                {b.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
              </span>
            </div>

            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span className="badge badge-accent" style={{ alignSelf: 'flex-start', marginBottom: '0.5rem' }}>
                {b.badgeText || 'অফার'}
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.4rem' }}>{b.title}</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, flex: 1 }}>
                {b.subtitle}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.75rem', marginTop: '1rem' }}>
                <button
                  onClick={() => handleToggle(b)}
                  className="btn btn-subtle btn-sm"
                >
                  {b.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="btn btn-subtle btn-sm"
                  style={{ color: 'var(--color-danger)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '520px', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>নতুন ব্যানার তৈরি করুন</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">শিরোনাম (Title) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="যেমন: তাজা ফল ও সুস্বাদু মিষ্টি"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">উপ-শিরোনাম (Subtitle)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="যেমন: বিষমুক্ত ও শতবর্ষের ঐতিহ্যের খাঁটি মিষ্টি"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">ছবি লিংক (Image URL) *</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">ক্লিক লিংক (Link URL)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">ব্যাজ টেক্সট</label>
                  <input
                    type="text"
                    className="form-input"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-subtle">
                  বাতিল
                </button>
                <button type="submit" className="btn btn-primary">
                  ব্যানার যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
