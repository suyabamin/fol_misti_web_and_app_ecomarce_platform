import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Filter, CheckCircle2, Clock, XCircle, Truck, Package } from 'lucide-react';
import { orderRepository } from '../../repositories/orderRepository';
import { Order, OrderStatus } from '../../models';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    const data = await orderRepository.getAll();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    if (newStatus === 'cancelled') {
      const confirmed = window.confirm('অর্ডারটি বাতিল করলে স্টক স্বয়ংক্রিয়ভাবে পুনরোদ্ধার হবে। আপনি কি নিশ্চিত?');
      if (!confirmed) return;
      await orderRepository.cancelOrder(orderId, 'অ্যাডমিন ড্যাশবোর্ড থেকে অর্ডার বাতিল করা হয়েছে।');
    } else {
      await orderRepository.updateStatus(orderId, newStatus);
    }
    loadOrders();
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(s);
      const matchName = o.deliveryAddress.fullName.toLowerCase().includes(s);
      const matchPhone = o.deliveryAddress.phone.includes(search);
      return matchNum || matchName || matchPhone;
    }
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>অর্ডার ব্যবস্থাপনা (Orders)</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            সর্বমোট {orders.length} টি অর্ডারের বিস্তারিত রেকর্ড
          </p>
        </div>
      </div>

      {/* Filter Tabs from reference A5 */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: `সকল অর্ডার (${orders.length})` },
          { id: 'pending', label: `অপেক্ষমান (${orders.filter(o => o.status === 'pending').length})` },
          { id: 'processing', label: `প্রক্রিয়াধীন (${orders.filter(o => o.status === 'processing').length})` },
          { id: 'shipped', label: `শিপিং-এ আছে (${orders.filter(o => o.status === 'shipped').length})` },
          { id: 'delivered', label: `ডেলিভার্ড (${orders.filter(o => o.status === 'delivered').length})` },
          { id: 'cancelled', label: `বাতিল (${orders.filter(o => o.status === 'cancelled').length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`btn ${filterStatus === tab.id ? 'btn-primary' : 'btn-subtle'} btn-sm`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          className="form-input"
          placeholder="অর্ডার নম্বর, গ্রাহকের নাম বা মোবাইল নম্বর দিয়ে সার্চ করুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Orders Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>অর্ডার নম্বর</th>
              <th>তারিখ</th>
              <th>গ্রাহকের তথ্য</th>
              <th>পণ্য সংখ্যা</th>
              <th>মূল্য (৳)</th>
              <th>পেমেন্ট</th>
              <th>অর্ডারের অবস্থা</th>
              <th style={{ textAlign: 'right' }}>বিস্তারিত</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  কোনো অর্ডার খুঁজে পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => (
                <tr key={ord.id}>
                  <td>
                    <strong style={{ color: 'var(--color-primary)' }}>{ord.orderNumber}</strong>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {new Date(ord.createdAt).toLocaleDateString('bn-BD')}
                  </td>
                  <td>
                    <strong style={{ fontSize: '0.9rem', display: 'block' }}>{ord.deliveryAddress.fullName}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{ord.deliveryAddress.phone}</span>
                  </td>
                  <td>{ord.items.length} টি</td>
                  <td>
                    <strong style={{ fontSize: '1rem' }}>৳{ord.total}</strong>
                  </td>
                  <td>
                    <span className="badge badge-subtle">
                      COD ({ord.paymentStatus === 'paid' ? 'পরিশোধিত' : 'বকেয়া'})
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-select"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem', width: 'auto', fontWeight: 600 }}
                      value={ord.status}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                    >
                      <option value="pending">অপেক্ষমান (Pending)</option>
                      <option value="processing">প্রক্রিয়াধীন (Processing)</option>
                      <option value="shipped">শিপিং-এ আছে (Shipped)</option>
                      <option value="delivered">ডেলিভার্ড (Delivered)</option>
                      <option value="cancelled">বাতিল (Cancelled)</option>
                    </select>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link to={`/admin/order/${ord.id}`} className="btn btn-subtle btn-sm">
                      <Eye size={15} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
