import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Calendar, ArrowUpRight, DollarSign, Package } from 'lucide-react';
import { orderRepository } from '../../repositories/orderRepository';
import { productRepository } from '../../repositories/productRepository';
import { Order, Product } from '../../models';

export const AdminReportsPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function load() {
      const [oList, pList] = await Promise.all([
        orderRepository.getAll(),
        productRepository.getAll()
      ]);
      setOrders(oList);
      setProducts(pList);
    }
    load();
  }, []);

  const totalSales = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const deliveredCount = orders.filter(o => o.status === 'delivered').length;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>রিপোর্টস ও অ্যানালিটিক্স (Reports)</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          মাসিক বিক্রয় প্রতিবেদন, রাজস্ব এবং সর্বাধিক জনপ্রিয় পণ্যের পারফরম্যান্স
        </p>
      </div>

      {/* Top summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>মোট আয় (Total Revenue)</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)', margin: '0.25rem 0' }}>
            ৳{totalSales.toLocaleString()}
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 600 }}>
            +১২.৫% গত মাসের চেয়ে বেশি
          </span>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>মোট অর্ডার সংখ্যা</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.25rem 0' }}>
            {orders.length} টি
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            সফল ডেলিভারি: {deliveredCount} টি
          </span>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>গড় অর্ডার মূল্য (AOV)</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-secondary)', margin: '0.25rem 0' }}>
            ৳{orders.length > 0 ? Math.round(totalSales / orders.length) : 0}
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            প্রতি অর্ডারে গড় ক্রয়
          </span>
        </div>
      </div>

      {/* Graphical Sales Bar Chart Representation from reference A14 */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2rem', boxShadow: 'var(--shadow-card)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>
          মাসিক বিক্রয় গ্রাফ (২০২৬)
        </h3>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '220px', paddingBottom: '1rem', borderBottom: '2px solid var(--color-border)', gap: '0.5rem' }}>
          {[
            { month: 'জানু', val: 45, amt: '৳৪৫,০০০' },
            { month: 'ফেব্রু', val: 62, amt: '৳৬২,০০০' },
            { month: 'মার্চ', val: 80, amt: '৳৮০,০০০' },
            { month: 'এপ্রিল', val: 95, amt: '৳৯৫,০০০' },
            { month: 'মে (আমের সিজন)', val: 140, amt: '৳১,৪০,০০০' },
            { month: 'জুন (আম/লিচু)', val: 180, amt: '৳১,৮০,০০০' },
            { month: 'জুলাই', val: 120, amt: '৳১,২০,০০০' },
            { month: 'অক্টোবর (বর্তমান)', val: 135, amt: '৳১,৩৫,০০০' }
          ].map((bar, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>{bar.amt}</span>
              <div
                style={{
                  width: '70%',
                  height: `${(bar.val / 200) * 100}%`,
                  background: i === 5 ? 'var(--color-accent)' : 'var(--color-primary)',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.4s ease'
                }}
                title={`${bar.month}: ${bar.amt}`}
              ></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '0.5rem' }}>{bar.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Selling Products List */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-card)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          শীর্ষ বিক্রিত ফল ও মিষ্টি
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {products.slice(0, 4).map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--color-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)', width: '24px' }}>#{i + 1}</span>
                <img src={p.imageUrl} alt={p.nameBn} style={{ width: '45px', height: '45px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                <div>
                  <strong style={{ fontSize: '0.95rem', display: 'block' }}>{p.nameBn}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{p.unit}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ fontSize: '1rem', color: 'var(--color-text)' }}>৳{p.discountPrice || p.price}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', display: 'block' }}>রেটিং {p.rating} ★</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
