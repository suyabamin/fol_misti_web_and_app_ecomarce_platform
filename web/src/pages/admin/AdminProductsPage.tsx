import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Edit2, Trash2, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { productRepository } from '../../repositories/productRepository';
import { Product } from '../../models';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    const data = await productRepository.getAll();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`আপনি কি নিশ্চিতভাবে "${name}" পণ্যটি মুছে ফেলতে চান?`)) {
      await productRepository.delete(id);
      loadProducts();
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const updated = { ...product, isActive: !product.isActive };
    await productRepository.save(updated);
    loadProducts();
  };

  const filtered = products.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      return p.name.toLowerCase().includes(s) || p.nameBn.includes(search);
    }
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>পণ্য তালিকা (Products)</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            মোট {products.length} টি পণ্য নিবন্ধিত আছে
          </p>
        </div>

        <Link to="/admin/add-product" className="btn btn-primary">
          <PlusCircle size={18} /> নতুন পণ্য যোগ করুন
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="পণ্যের নাম দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: '200px' }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">সকল ক্যাটাগরি</option>
          <option value="fruits">তাজা ফল (Fruits)</option>
          <option value="sweets">ঐতিহ্যবাহী মিষ্টি (Sweets)</option>
          <option value="mango-collection">আমের স্পেশাল (Mangoes)</option>
          <option value="sweet-boxes">উপহার ও মিষ্টি বক্স</option>
        </select>
      </div>

      {/* Table from reference A2 */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ছবি ও পণ্যের নাম</th>
              <th>ক্যাটাগরি</th>
              <th>একক</th>
              <th>মূল্য (৳)</th>
              <th>স্টক</th>
              <th>অবস্থা</th>
              <th style={{ textAlign: 'right' }}>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={p.imageUrl}
                      alt={p.nameBn}
                      style={{ width: '45px', height: '45px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.95rem', display: 'block' }}>{p.nameBn}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{p.name}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge badge-subtle">{p.category}</span>
                </td>
                <td>{p.unit}</td>
                <td>
                  <strong>৳{p.discountPrice || p.price}</strong>
                  {p.discountPrice && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textDecoration: 'line-through', marginLeft: '0.35rem' }}>
                      ৳{p.price}
                    </span>
                  )}
                </td>
                <td>
                  <span className={`badge ${p.stock <= 20 ? 'badge-danger' : 'badge-success'}`}>
                    {p.stock}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleToggleStatus(p)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {p.isActive ? (
                      <span className="badge badge-success">সক্রিয়</span>
                    ) : (
                      <span className="badge badge-danger">নিষ্ক্রিয়</span>
                    )}
                  </button>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                    <Link to={`/product/${p.id}`} target="_blank" className="btn btn-subtle btn-sm" title="প্রিভিউ দেখুন">
                      <Eye size={14} />
                    </Link>
                    <Link to={`/admin/edit-product/${p.id}`} className="btn btn-subtle btn-sm" title="সম্পাদনা">
                      <Edit2 size={14} />
                    </Link>
                    <button
                      className="btn btn-subtle btn-sm"
                      style={{ color: 'var(--color-danger)' }}
                      onClick={() => handleDelete(p.id, p.nameBn)}
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
