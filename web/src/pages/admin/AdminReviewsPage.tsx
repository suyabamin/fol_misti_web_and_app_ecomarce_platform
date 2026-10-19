import React, { useEffect, useState } from 'react';
import { Star, Check, X, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { reviewRepository } from '../../repositories/reviewRepository';
import { Review } from '../../models';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  const loadReviews = async () => {
    const list = await reviewRepository.getAll();
    setReviews(list);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    await reviewRepository.updateStatus(id, status);
    loadReviews();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('আপনি কি এই রিভিউটি মুছে ফেলতে চান?')) {
      await reviewRepository.delete(id);
      loadReviews();
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>রিভিউ মডারেশন (Review Moderation)</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          গ্রাহকদের মূল্যায়িত মতামত অনুমোদন বা গোপন করুন
        </p>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>পণ্য</th>
              <th>গ্রাহক</th>
              <th>রেটিং</th>
              <th>মতামত (Comment)</th>
              <th>তারিখ</th>
              <th>অবস্থা</th>
              <th style={{ textAlign: 'right' }}>মডারেশন</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>
                    {r.productName || r.productId}
                  </strong>
                </td>
                <td>{r.userName}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Star size={14} fill="#fab818" color="#fab818" />
                    <strong>{r.rating}</strong>
                  </div>
                </td>
                <td style={{ maxWidth: '300px', fontSize: '0.85rem' }}>
                  "{r.comment}"
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {new Date(r.createdAt).toLocaleDateString('bn-BD')}
                </td>
                <td>
                  <span className={`badge ${r.status === 'approved' ? 'badge-success' : r.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                    {r.status === 'approved' ? 'অনুমোদিত' : r.status === 'rejected' ? 'বাতিল' : 'অপেক্ষমান'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                    {r.status !== 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'approved')}
                        className="btn btn-subtle btn-sm"
                        style={{ color: 'var(--color-success)' }}
                        title="অনুমোদন করুন"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    {r.status !== 'rejected' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'rejected')}
                        className="btn btn-subtle btn-sm"
                        style={{ color: 'var(--color-danger)' }}
                        title="বাতিল করুন"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="btn btn-subtle btn-sm"
                      style={{ color: 'var(--color-danger)' }}
                      title="মুছুন"
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
    </div>
  );
};
