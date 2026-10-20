import React, { useEffect, useState } from 'react';
import { Users, Search, Mail, Phone, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { userRepository } from '../../repositories/userRepository';
import { RegisteredUserItem } from '../../data/initialData';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<RegisteredUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const list = await userRepository.getRegisteredUsers();
      setCustomers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (uid: string) => {
    const target = customers.find(c => c.uid === uid);
    if (!target) return;
    const nextStatus: 'active' | 'suspended' = target.status === 'active' ? 'suspended' : 'active';
    const updated: RegisteredUserItem = { ...target, status: nextStatus };
    await userRepository.saveRegisteredUser(updated);
    setCustomers(prev => prev.map(c => c.uid === uid ? updated : c));
  };

  const filtered = customers.filter(c => {
    if (search.trim()) {
      const s = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        c.phone.includes(search)
      );
    }
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>গ্রাহকবৃন্দ (Customers)</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            নিবন্ধিত গ্রাহক এবং তাদের অর্ডার ইতিহাস
          </p>
        </div>

        <Link to="/admin/delivery-people" className="btn btn-outline btn-md" style={{ gap: '0.5rem' }}>
          <Truck size={18} />
          <span>ডেলিভারি রাইডার ব্যবস্থাপনা</span>
        </Link>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          className="form-input"
          placeholder="গ্রাহকের নাম, ইমেইল বা ফোন নম্বর দিয়ে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="data-table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            গ্রাহক তালিকা লোড হচ্ছে...
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>গ্রাহক</th>
                <th>যোগাযোগ</th>
                <th>জেলা</th>
                <th>মোট অর্ডার</th>
                <th>মোট খরচ</th>
                <th>ভূমিকা</th>
                <th>স্ট্যাটাস</th>
                <th style={{ textAlign: 'right' }}>পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.uid}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.95rem', display: 'block' }}>{c.name}</strong>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', display: 'block' }}>{c.email}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{c.phone}</span>
                  </td>
                  <td>{c.district || 'ঢাকা'}</td>
                  <td>
                    <strong style={{ color: 'var(--color-primary)' }}>{c.ordersCount || 0} টি</strong>
                  </td>
                  <td>৳{(c.totalSpent || 0).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${c.role === 'delivery' ? 'badge-primary' : 'badge-subtle'}`}>
                      {c.role === 'delivery' ? 'ডেলিভারি রাইডার' : c.role === 'admin' ? 'অ্যাডমিন' : 'গ্রাহক'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {c.status === 'active' ? 'সক্রিয়' : 'স্থগিত'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleToggleStatus(c.uid)}
                      className="btn btn-subtle btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      {c.status === 'active' ? 'স্থগিত করুন' : 'সক্রিয় করুন'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

