import React, { useEffect, useState } from 'react';
import { Boxes, Plus, Minus, AlertTriangle, CheckCircle2, Save } from 'lucide-react';
import { productRepository } from '../../repositories/productRepository';
import { Product } from '../../models';

export const AdminStockPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockChanges, setStockChanges] = useState<{ [id: string]: number }>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadProducts = async () => {
    const list = await productRepository.getAll();
    setProducts(list);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleStockDelta = (id: string, currentStock: number, delta: number) => {
    const currentVal = stockChanges[id] !== undefined ? stockChanges[id] : currentStock;
    const nextVal = Math.max(0, currentVal + delta);
    setStockChanges({ ...stockChanges, [id]: nextVal });
  };

  const handleSaveStock = async (id: string) => {
    if (stockChanges[id] === undefined) return;
    setSavingId(id);
    await productRepository.updateStock(id, stockChanges[id]);
    await loadProducts();
    setSavingId(null);
    const updated = { ...stockChanges };
    delete updated[id];
    setStockChanges(updated);
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>স্টক ব্যবস্থাপনা (Stock Management)</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          বাস্তব সময়ে পণ্য ইনভেন্টরি পর্যবেক্ষণ এবং দ্রুত স্টক সমন্বয় করুন
        </p>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>পণ্য ও ছবি</th>
              <th>ক্যাটাগরি</th>
              <th>একক</th>
              <th>বর্তমান মজুদ (Current Stock)</th>
              <th>স্ট্যাটাস</th>
              <th style={{ textAlign: 'center' }}>স্টক সমন্বয় (+ / -)</th>
              <th style={{ textAlign: 'right' }}>সংরক্ষণ</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const currentDisplayStock = stockChanges[p.id] !== undefined ? stockChanges[p.id] : p.stock;
              const hasChanged = stockChanges[p.id] !== undefined && stockChanges[p.id] !== p.stock;

              return (
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
                    <strong style={{ fontSize: '1.15rem', color: p.stock <= 20 ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                      {currentDisplayStock}
                    </strong>
                  </td>
                  <td>
                    {currentDisplayStock <= 0 ? (
                      <span className="badge badge-danger">স্টক আউট</span>
                    ) : currentDisplayStock <= 20 ? (
                      <span className="badge badge-warning">লো-স্টক</span>
                    ) : (
                      <span className="badge badge-success">পর্যাপ্ত</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        className="btn btn-subtle btn-sm"
                        onClick={() => handleStockDelta(p.id, p.stock, -5)}
                        title="-5"
                      >
                        <Minus size={14} /> 5
                      </button>
                      <button
                        className="btn btn-subtle btn-sm"
                        onClick={() => handleStockDelta(p.id, p.stock, -1)}
                        title="-1"
                      >
                        <Minus size={14} /> 1
                      </button>
                      <button
                        className="btn btn-subtle btn-sm"
                        onClick={() => handleStockDelta(p.id, p.stock, +1)}
                        title="+1"
                      >
                        <Plus size={14} /> 1
                      </button>
                      <button
                        className="btn btn-subtle btn-sm"
                        onClick={() => handleStockDelta(p.id, p.stock, +10)}
                        title="+10"
                      >
                        <Plus size={14} /> 10
                      </button>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSaveStock(p.id)}
                      disabled={!hasChanged || savingId === p.id}
                      style={{ opacity: hasChanged ? 1 : 0.4 }}
                    >
                      <Save size={14} />
                      <span>{savingId === p.id ? '...' : 'সেভ'}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
