import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  Clock,
  Phone,
  Search,
  Filter
} from 'lucide-react';
import { deliveryRepository } from '../../repositories/deliveryRepository';
import { DeliveryIssue } from '../../models';

export const AdminDeliveryIssuesPage: React.FC = () => {
  const [issues, setIssues] = useState<DeliveryIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const list = await deliveryRepository.getAllIssues();
      setIssues(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter(it => {
    const matchSearch =
      it.orderNumber.includes(search) ||
      it.customerName.toLowerCase().includes(search.toLowerCase()) ||
      it.customerPhone.includes(search);
    const matchStatus = statusFilter === 'all' || it.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
          ডেলিভারি সমস্যা ও বিরোধ তদন্ত (Delivery Issues) ⚠️
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          গ্রাহকদের রিপোর্টকৃত ডেলিভারি সংক্রান্ত সমস্যা ও সমাধানের তালিকা
        </p>
      </div>

      {/* Filter and Search */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="অর্ডার #, গ্রাহকের নাম বা ফোন দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: '180px' }}
        >
          <option value="all">সকল অভিযোগ</option>
          <option value="open">নতুন অভিযোগ (Open)</option>
          <option value="investigating">তদন্তাধীন</option>
          <option value="resolved">মীমাংসিত (Resolved)</option>
        </select>
      </div>

      {/* Issues Table */}
      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>লোড হচ্ছে...</div>
        ) : filteredIssues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--color-text-muted)' }}>
            <CheckCircle2 size={44} style={{ color: '#16a34a', margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem' }}>কোনো সক্রিয় সমস্যা বা বিরোধ নেই!</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>সকল ডেলিভারি নির্বিঘ্নে সম্পন্ন হচ্ছে।</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem' }}>অর্ডার নম্বর</th>
                  <th style={{ padding: '1rem' }}>গ্রাহকের বিবরণ</th>
                  <th style={{ padding: '1rem' }}>সমস্যার ধরন</th>
                  <th style={{ padding: '1rem' }}>বিবরণ</th>
                  <th style={{ padding: '1rem' }}>স্ট্যাটাস</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>একশন</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((iss) => (
                  <tr key={iss.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 800 }}>
                      <Link to={`/admin/order/${iss.orderId}`} style={{ color: 'var(--color-primary)' }}>
                        #{iss.orderNumber}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700 }}>{iss.customerName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{iss.customerPhone}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-danger">
                        {iss.issueType === 'damaged_product' ? 'পণ্য ক্ষতিগ্রস্ত' :
                         iss.issueType === 'missing_item' ? 'পণ্য কম' :
                         iss.issueType === 'wrong_order' ? 'ভুল অর্ডার' :
                         iss.issueType === 'not_delivered' ? 'পণ্য পৌঁছেনি' : 'অন্যান্য'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', maxWidth: '300px' }}>
                      {iss.description}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${iss.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>
                        {iss.status === 'resolved' ? 'মীমাংসিত' : 'খোলা / ওপেন'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Link
                        to="/admin/chat"
                        className="btn btn-outline btn-sm"
                        style={{ gap: '0.35rem', fontSize: '0.75rem' }}
                      >
                        <MessageSquare size={13} />
                        <span>চ্যাট খুলুন</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
