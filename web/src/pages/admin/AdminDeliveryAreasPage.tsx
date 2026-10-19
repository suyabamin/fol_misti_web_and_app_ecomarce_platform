import React, { useEffect, useState } from 'react';
import { MapPin, PlusCircle, Edit2, CheckCircle2 } from 'lucide-react';
import { settingsRepository } from '../../repositories/settingsRepository';
import { DeliveryArea } from '../../models';

export const AdminDeliveryAreasPage: React.FC = () => {
  const [areas, setAreas] = useState<DeliveryArea[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<DeliveryArea | null>(null);

  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [fee, setFee] = useState<number>(60);
  const [estimatedHours, setEstimatedHours] = useState('১২-২৪ ঘণ্টা');
  const [isActive, setIsActive] = useState(true);

  const loadAreas = async () => {
    const data = await settingsRepository.getDeliveryAreas();
    setAreas(data);
  };

  useEffect(() => {
    loadAreas();
  }, []);

  const openAddModal = () => {
    setEditingArea(null);
    setName('');
    setNameBn('');
    setFee(60);
    setEstimatedHours('১২-২৪ ঘণ্টা');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (area: DeliveryArea) => {
    setEditingArea(area);
    setName(area.name);
    setNameBn(area.nameBn);
    setFee(area.fee);
    setEstimatedHours(area.estimatedHours);
    setIsActive(area.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim()) return;

    const newArea: DeliveryArea = {
      id: editingArea ? editingArea.id : `area-${Date.now()}`,
      name: name.trim() || nameBn.trim(),
      nameBn: nameBn.trim(),
      fee: Number(fee),
      estimatedHours,
      isActive
    };

    await settingsRepository.saveDeliveryArea(newArea);
    setIsModalOpen(false);
    loadAreas();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>ডেলিভারি এরিয়া (Delivery Areas)</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            ভিন্ন ভিন্ন জোন ও জেলার ডেলিভারি চার্জ ও সময়সীমা কনফিগার করুন
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary">
          <PlusCircle size={18} /> নতুন এরিয়া যোগ
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>জোন / এরিয়া নাম</th>
              <th>ডেলিভারি চার্জ (৳)</th>
              <th>আনুমানিক সময়</th>
              <th>স্ট্যাটাস</th>
              <th style={{ textAlign: 'right' }}>সম্পাদনা</th>
            </tr>
          </thead>
          <tbody>
            {areas.map((a) => (
              <tr key={a.id}>
                <td>
                  <strong style={{ fontSize: '0.95rem', display: 'block' }}>{a.nameBn}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{a.name}</span>
                </td>
                <td>
                  <strong style={{ color: 'var(--color-primary)', fontSize: '1.05rem' }}>৳{a.fee}</strong>
                </td>
                <td>{a.estimatedHours}</td>
                <td>
                  <span className={`badge ${a.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {a.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => openEditModal(a)} className="btn btn-subtle btn-sm">
                    <Edit2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '480px', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>
              {editingArea ? 'এরিয়া সম্পাদনা' : 'নতুন ডেলিভারি এরিয়া যোগ'}
            </h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">এলাকার নাম (বাংলা) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="যেমন: ঢাকা উত্তর"
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
                  placeholder="e.g. Dhaka North"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">চার্জ (৳) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={fee}
                    onChange={(e) => setFee(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">সময়সীমা</label>
                  <input
                    type="text"
                    className="form-input"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                  />
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
