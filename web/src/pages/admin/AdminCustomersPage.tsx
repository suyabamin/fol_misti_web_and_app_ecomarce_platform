import React, { useState } from 'react';
import { Users, Search, Mail, Phone, ShoppingBag, ShieldCheck } from 'lucide-react';

interface MockCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  district: string;
  ordersCount: number;
  totalSpent: number;
  status: 'active' | 'suspended';
  joinedDate: string;
}

const INITIAL_CUSTOMERS: MockCustomer[] = [
  {
    id: 'cust-1',
    name: 'Tanvir Ahmed',
    email: 'tanvir@gmail.com',
    phone: '01712-345678',
    district: 'ঢাকা',
    ordersCount: 4,
    totalSpent: 3840,
    status: 'active',
    joinedDate: '2026-02-14'
  },
  {
    id: 'cust-2',
    name: 'Nusrat Jahan',
    email: 'nusrat.j@yahoo.com',
    phone: '01819-876543',
    district: 'চট্টগ্রাম',
    ordersCount: 3,
    totalSpent: 2450,
    status: 'active',
    joinedDate: '2026-03-01'
  },
  {
    id: 'cust-3',
    name: 'Mahmudul Hasan',
    email: 'mahmud.h@gmail.com',
    phone: '01911-223344',
    district: 'রাজশাহী',
    ordersCount: 6,
    totalSpent: 6200,
    status: 'active',
    joinedDate: '2026-01-20'
  },
  {
    id: 'cust-4',
    name: 'Farhana Akter',
    email: 'farhana.akter@outlook.com',
    phone: '01677-998877',
    district: 'সিলেট',
    ordersCount: 2,
    totalSpent: 1850,
    status: 'active',
    joinedDate: '2026-04-10'
  }
];

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<MockCustomer[]>(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState('');

  const handleToggleStatus = (id: string) => {
    setCustomers(prev =>
      prev.map(c =>
        c.id === id ? { ...c, status: c.status === 'active' ? 'suspended' : 'active' } : c
      )
    );
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
        <table className="data-table">
          <thead>
            <tr>
              <th>গ্রাহক</th>
              <th>যোগাযোগ</th>
              <th>জেলা</th>
              <th>মোট অর্ডার</th>
              <th>মোট খরচ</th>
              <th>নিবন্ধন তারিখ</th>
              <th>স্ট্যাটাস</th>
              <th style={{ textAlign: 'right' }}>পদক্ষেপ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
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
                <td>{c.district}</td>
                <td>
                  <strong style={{ color: 'var(--color-primary)' }}>{c.ordersCount} টি</strong>
                </td>
                <td>৳{c.totalSpent.toLocaleString()}</td>
                <td style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{c.joinedDate}</td>
                <td>
                  <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                    {c.status === 'active' ? 'সক্রিয়' : 'স্থগিত'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => handleToggleStatus(c.id)}
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
      </div>
    </div>
  );
};
