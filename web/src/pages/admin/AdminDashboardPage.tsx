import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Eye,
  PlusCircle,
  Clock,
  CheckCircle2,
  Boxes
} from 'lucide-react';
import { orderRepository } from '../../repositories/orderRepository';
import { productRepository } from '../../repositories/productRepository';
import { Order, Product } from '../../models';

export const AdminDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [ordList, prodList] = await Promise.all([
          orderRepository.getAll(),
          productRepository.getAll()
        ]);
        setOrders(ordList);
        setProducts(prodList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const lowStockProducts = products.filter(p => p.stock <= 20);

  return (
    <div className="admin-dashboard-page">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
            ড্যাশবোর্ড ওভারভিউ
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            ফল মিষ্টির সার্বিক বিক্রয় ও অপারেশনের সার্বক্ষণিক পরিসংখ্যান
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/add-product" className="btn btn-primary btn-sm">
            <PlusCircle size={16} /> নতুন পণ্য যোগ
          </Link>
          <Link to="/admin/orders" className="btn btn-subtle btn-sm">
            সকল অর্ডার দেখুন
          </Link>
        </div>
      </div>

      {/* Metrics Row from reference image A1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Total Orders */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'block' }}>মোট অর্ডার</span>
            <strong style={{ fontSize: '1.75rem', color: 'var(--color-text)' }}>{orders.length}</strong>
          </div>
        </div>

        {/* Total Revenue */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'block' }}>মোট রাজস্ব (Revenue)</span>
            <strong style={{ fontSize: '1.75rem', color: '#16a34a' }}>৳{totalRevenue.toLocaleString()}</strong>
          </div>
        </div>

        {/* Pending Orders */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'block' }}>পেন্ডিং অর্ডার</span>
            <strong style={{ fontSize: '1.75rem', color: '#d97706' }}>{pendingOrders.length}</strong>
          </div>
        </div>

        {/* Total Products */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: '#fce7f3', color: '#be185d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Boxes size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'block' }}>মোট সক্রিয় পণ্য</span>
            <strong style={{ fontSize: '1.75rem', color: 'var(--color-text)' }}>{products.length}</strong>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Orders & Low Stock Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Recent Orders Table */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>সাম্প্রতিক অর্ডারসমূহ</h3>
            <Link to="/admin/orders" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              সব দেখুন →
            </Link>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>অর্ডার নম্বর</th>
                  <th>গ্রাহক</th>
                  <th>মোট ৳</th>
                  <th>স্ট্যাটাস</th>
                  <th>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id}>
                    <td>
                      <strong style={{ color: 'var(--color-primary)' }}>{ord.orderNumber}</strong>
                    </td>
                    <td>{ord.deliveryAddress.fullName}</td>
                    <td>৳{ord.total}</td>
                    <td>
                      <span className={`badge ${ord.status === 'delivered' ? 'badge-success' : ord.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/order/${ord.id}`} className="btn btn-subtle btn-sm">
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c' }}>
              <AlertTriangle size={18} /> লো-স্টক অ্যালার্ট
            </h3>
            <Link to="/admin/stock" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              স্টক ম্যানেজ করুন →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {lowStockProducts.slice(0, 5).map((prod) => (
              <div
                key={prod.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={prod.imageUrl}
                    alt={prod.nameBn}
                    style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                  />
                  <div>
                    <strong style={{ fontSize: '0.9rem', display: 'block' }}>{prod.nameBn}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{prod.unit}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-danger">
                    স্টক: {prod.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
