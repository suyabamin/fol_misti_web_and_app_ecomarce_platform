import React, { useEffect, useState } from 'react';
import { PlusCircle, Edit2, Trash2, FolderTree, Image as ImageIcon } from 'lucide-react';
import { categoryRepository } from '../../repositories/categoryRepository';
import { Category } from '../../models';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  const loadCategories = async () => {
    const list = await categoryRepository.getAll();
    setCategories(list);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setNameBn('');
    setSlug('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80');
    setSortOrder(categories.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setNameBn(cat.nameBn);
    setSlug(cat.slug);
    setDescription(cat.description);
    setImageUrl(cat.imageUrl);
    setSortOrder(cat.sortOrder);
    setIsActive(cat.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim()) return;

    const newCat: Category = {
      id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
      name: name.trim() || nameBn.trim(),
      nameBn: nameBn.trim(),
      slug: slug.trim() || `cat-${Date.now()}`,
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      sortOrder: Number(sortOrder),
      isActive
    };

    await categoryRepository.save(newCat);
    setIsModalOpen(false);
    loadCategories();
  };

  const handleDelete = async (id: string, nameBn: string) => {
    if (window.confirm(`আপনি কি "${nameBn}" ক্যাটাগরিটি মুছে ফেলতে চান?`)) {
      await categoryRepository.delete(id);
      loadCategories();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>ক্যাটাগরি ব্যবস্থাপনা (Categories)</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            মোট {categories.length} টি ক্যাটাগরি রয়েছে
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary">
          <PlusCircle size={18} /> নতুন ক্যাটাগরি যোগ
        </button>
      </div>

      {/* Table from reference A4 */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ছবি</th>
              <th>ক্যাটাগরির নাম (বাংলা ও ইংরেজি)</th>
              <th>স্ল্যাগ (Slug)</th>
              <th>ক্রম (Order)</th>
              <th>স্ট্যাটাস</th>
              <th style={{ textAlign: 'right' }}>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td style={{ width: '60px' }}>
                  <img
                    src={c.imageUrl}
                    alt={c.nameBn}
                    style={{ width: '45px', height: '45px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                  />
                </td>
                <td>
                  <strong style={{ fontSize: '1rem', display: 'block' }}>{c.nameBn}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{c.name}</span>
                </td>
                <td>
                  <code>{c.slug}</code>
                </td>
                <td>{c.sortOrder}</td>
                <td>
                  <span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {c.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                    <button onClick={() => openEditModal(c)} className="btn btn-subtle btn-sm">
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.nameBn)}
                      className="btn btn-subtle btn-sm"
                      style={{ color: 'var(--color-danger)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '520px', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>
              {editingCategory ? 'ক্যাটাগরি সম্পাদনা' : 'নতুন ক্যাটাগরি তৈরি'}
            </h3>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">বাংলা নাম *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="যেমন: তাজা ফল"
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">ইংরেজি নাম</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Fresh Fruits"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">স্ল্যাগ (Slug) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. fresh-fruits"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">ছবি লিংক (Image URL)</label>
                <input
                  type="url"
                  className="form-input"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">ক্রমিক নম্বর</label>
                  <input
                    type="number"
                    className="form-input"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                  />
                </div>
                <div style={{ paddingTop: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <span>সক্রিয় রাখুন</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-subtle">
                  বাতিল
                </button>
                <button type="submit" className="btn btn-primary">
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
