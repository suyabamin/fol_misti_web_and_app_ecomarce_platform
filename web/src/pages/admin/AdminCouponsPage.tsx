import React, { useEffect, useState } from 'react';
import { PlusCircle, Edit2, Trash2, Tag, CheckCircle2 } from 'lucide-react';
import { couponRepository } from '../../repositories/couponRepository';
import { Coupon } from '../../models';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(500);
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>(200);
  const [validUntil, setValidUntil] = useState('2026-12-31');
  const [usageLimit, setUsageLimit] = useState<number>(500);
  const [isActive, setIsActive] = useState(true);

  const loadCoupons = async () => {
    const list = await couponRepository.getAll();
    setCoupons(list);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const newCoupon: Coupon = {
      id: `c-${Date.now()}`,
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      minOrderAmount: Number(minOrderAmount),
      maxDiscount: type === 'percentage' && maxDiscount ? Number(maxDiscount) : undefined,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil,
      usageLimit: Number(usageLimit),
      usageCount: 0,
      isActive
    };

    await couponRepository.save(newCoupon);
    setIsModalOpen(false);
    setCode('');
    loadCoupons();
  };

  const handleToggle = async (c: Coupon) => {
    await couponRepository.save({ ...c, isActive: !c.isActive });
    loadCoupons();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('আপনি কি এই কুপনটি মুছে ফেলতে চান?')) {
      await couponRepository.delete(id);
      loadCoupons();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>কুপন ও ছাড় ব্যবস্থাপনা (Coupons)</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            প্রোমোকোড তৈরি ও ডিসকাউন্ট পরিচালনা করুন
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <PlusCircle size={18} /> নতুন কুপন তৈরি
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>কুপন কোড</th>
              <th>ডিসকাউন্ট ধরন ও মান</th>
              <th>সর্বনিম্ন অর্ডার</th>
              <th>মেয়াদ</th>
              <th>ব্যবহার সীমা</th>
              <th>স্ট্যাটাস</th>
              <th style={{ textAlign: 'right' }}>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--color-primary)', letterSpacing: '0.5px' }}>
                    {c.code}
                  </strong>
                </td>
                <td>
                  {c.type === 'percentage' ? (
                    <span><strong>{c.value}%</strong> (সর্বোচ্চ ৳{c.maxDiscount || 'আনলিমিটেড'})</span>
                  ) : (
                    <span><strong>৳{c.value}</strong> নির্দিষ্ট ছাড়</span>
                  )}
                </td>
                <td>৳{c.minOrderAmount}</td>
                <td>{c.validUntil}</td>
                <td>{c.usageCount} / {c.usageLimit || '∞'}</td>
                <td>
                  <button
                    onClick={() => handleToggle(c)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <span className={`badge ${c.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {c.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                  </button>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="btn btn-subtle btn-sm"
                    style={{ color: 'var(--color-danger)' }}
                  >
                    <Trash2 size={14} />
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
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>নতুন কুপন কোড তৈরি</h3>
            <form onSubmit={handleCreateCoupon}>
              <div className="form-group">
                <label className="form-label">কুপন কোড *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="যেমন: EID20 বা SUMMER100"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">ছাড়ের ধরন</label>
                  <select
                    className="form-select"
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                  >
                    <option value="percentage">শতাংশ (%)</option>
                    <option value="fixed">নির্দিষ্ট টাকা (৳)</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">ছাড়ের মান *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">সর্বনিম্ন অর্ডার (৳)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">সর্বোচ্চ ছাড় (৳)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="ঐচ্ছিক"
                    value={maxDiscount || ''}
                    onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : undefined)}
                    disabled={type === 'fixed'}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">মেয়াদ শেষ হওয়ার তারিখ</label>
                <input
                  type="date"
                  className="form-input"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-subtle">
                  বাতিল
                </button>
                <button type="submit" className="btn btn-primary">
                  কুপন তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
