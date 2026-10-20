import React, { useEffect, useState, useRef } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Truck,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Navigation,
  DollarSign,
  PackageCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deliveryRepository } from '../../repositories/deliveryRepository';
import { orderRepository } from '../../repositories/orderRepository';
import { Order, DeliveryProfile } from '../../models';

interface ContextType {
  profile: DeliveryProfile | null;
  reloadProfile: () => void;
}

export const DeliveryDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { profile, reloadProfile } = useOutletContext<ContextType>();
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [gpsActiveOrderId, setGpsActiveOrderId] = useState<string | null>(null);

  const geoWatchIdRef = useRef<number | null>(null);

  useEffect(() => {
    loadOrders();
    return () => {
      // Clean up geolocation watcher on unmount
      if (geoWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
      }
    };
  }, [currentUser?.uid]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const allOrders: Order[] = await orderRepository.getOrders();
      // Filter orders assigned to this rider that are not yet receipt_confirmed or cancelled
      const riderOrders = allOrders.filter(
        (o: Order) =>
          (o.assignedDeliveryPersonId === currentUser?.uid ||
           o.assignedDeliveryPersonId === profile?.uid ||
           o.assignedDeliveryPersonId === 'delivery-agent-1') &&
          o.status !== 'cancelled' &&
          o.status !== 'receipt_confirmed'
      );
      setAssignedOrders(riderOrders);

      // Check if any order is currently out_for_delivery and start GPS watch
      const activeDelivery = riderOrders.find((o: Order) => o.status === 'out_for_delivery');
      if (activeDelivery) {
        startGpsTracking(activeDelivery.id);
      }
    } catch (err) {
      console.error('Failed to load rider orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const startGpsTracking = (orderId: string) => {
    if (!navigator.geolocation) {
      setMessage({ text: 'আপনার ব্রাউজারে Geolocation সমর্থিত নয়।', type: 'error' });
      return;
    }

    setGpsActiveOrderId(orderId);

    // Initial position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        deliveryRepository.updateLocation(orderId, currentUser?.uid || 'delivery-agent-1', {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          heading: pos.coords.heading || undefined,
          speed: pos.coords.speed || undefined,
          accuracy: pos.coords.accuracy || undefined,
          status: 'live'
        });
      },
      (err) => {
        console.warn('GPS initial position error:', err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    // Continuous watch
    if (geoWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
    }

    geoWatchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        deliveryRepository.updateLocation(orderId, currentUser?.uid || 'delivery-agent-1', {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          heading: pos.coords.heading || undefined,
          speed: pos.coords.speed || undefined,
          accuracy: pos.coords.accuracy || undefined,
          status: 'live'
        });
      },
      (err) => {
        console.warn('GPS watch error:', err.message);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  };

  const handleStartDelivery = async (orderId: string) => {
    setActionLoadingId(orderId);
    setMessage(null);
    try {
      await deliveryRepository.startDelivery(orderId, currentUser?.uid || 'delivery-agent-1');
      startGpsTracking(orderId);
      setMessage({ text: 'ডেলিভারি শুরু হয়েছে এবং জিপিএস ট্র্যাকিং সক্রিয় রয়েছে!', type: 'success' });
      await loadOrders();
      reloadProfile();
    } catch (err: any) {
      setMessage({ text: err.message || 'ডেলিভারি শুরু করতে সমস্যা হয়েছে।', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkHandedOver = async (orderId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে পণ্যটি গ্রাহকের হাতে তুলে দিয়েছেন? (গ্রাহক পরবর্তীতে এটি নিশ্চিত করবেন)')) {
      return;
    }

    setActionLoadingId(orderId);
    setMessage(null);
    try {
      await deliveryRepository.markHandedOver(orderId, currentUser?.uid || 'delivery-agent-1');
      // Stop GPS watch
      if (geoWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
        geoWatchIdRef.current = null;
      }
      setGpsActiveOrderId(null);

      setMessage({
        text: 'পণ্য হস্তান্তর চিহ্নিত করা হয়েছে। গ্রাহকের নিশ্চিতকরণের পর আপনার একাউন্টে আয় যুক্ত হবে।',
        type: 'success'
      });
      await loadOrders();
      reloadProfile();
    } catch (err: any) {
      setMessage({ text: err.message || 'হস্তান্তর চিহ্নিত করা সম্ভব হয়নি।', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div>
      {/* Rider Header Summary */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
          স্বাগতম, {profile?.name || 'ডেলিভারি রাইডার'} 👋
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          আজকের অ্যাসাইনকৃত ডেলিভারি ও রুট পরিচালনা করুন
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: message.type === 'success' ? 'var(--color-primary-light)' : 'var(--color-danger-light)',
            color: message.type === 'success' ? 'var(--color-primary)' : 'var(--color-danger)',
            fontWeight: 600
          }}
        >
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--color-surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>চলমান অ্যাসাইনমেন্ট</span>
            <Truck size={20} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)' }}>
            {assignedOrders.length} টি
          </div>
        </div>

        <div style={{ background: 'var(--color-surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>মোট সম্পন্ন ডেলিভারি</span>
            <PackageCheck size={20} style={{ color: '#16a34a' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)' }}>
            {profile?.totalCompletedDeliveries || 0} টি
          </div>
        </div>

        <div style={{ background: 'var(--color-surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>বকেয়া পাওনা আয়</span>
            <DollarSign size={20} style={{ color: '#eab308' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            ৳{profile?.outstandingPayableAmount || 0}
          </div>
        </div>
      </div>

      {/* Active Deliveries List */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>অ্যাসাইনকৃত ডেলিভারি সমূহ</span>
        <span style={{ fontSize: '0.85rem', background: 'var(--color-primary)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
          {assignedOrders.length}
        </span>
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          অর্ডার লোড হচ্ছে...
        </div>
      ) : assignedOrders.length === 0 ? (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--color-text-secondary)'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            বর্তমানে কোনো পেন্ডিং ডেলিভারি নেই
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            নতুন কোনো অর্ডার অ্যাসাইন হলে তা এখানে প্রদর্শিত হবে। আপনার স্ট্যাটাস "রেডি / Available" রাখুন।
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {assignedOrders.map((order) => {
            const isGpsRunning = gpsActiveOrderId === order.id;

            return (
              <div
                key={order.id}
                style={{
                  background: 'var(--color-surface)',
                  border: isGpsRunning ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-md)',
                  position: 'relative'
                }}
              >
                {/* Header & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text)' }}>
                      অর্ডার #{order.orderNumber}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={13} />
                      <span>{new Date(order.createdAt).toLocaleString('bn-BD')}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {order.status === 'out_for_delivery' && (
                      <span
                        style={{
                          background: 'rgba(22, 163, 74, 0.15)',
                          color: '#16a34a',
                          padding: '0.3rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <span className="status-indicator-dot status-dot-available" />
                        <span>রওনা হয়েছেন</span>
                      </span>
                    )}

                    {order.status === 'handed_over' && (
                      <span
                        style={{
                          background: 'rgba(234, 179, 8, 0.15)',
                          color: '#b45309',
                          padding: '0.3rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}
                      >
                        হস্তান্তরিত (গ্রাহক নিশ্চিতকরণের অপেক্ষা)
                      </span>
                    )}

                    {order.status === 'assigned' && (
                      <span
                        style={{
                          background: 'var(--color-primary-light)',
                          color: 'var(--color-primary)',
                          padding: '0.3rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}
                      >
                        নতুন অ্যাসাইনমেন্ট
                      </span>
                    )}
                  </div>
                </div>

                {/* Customer Details & Address */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
                      গ্রাহকের তথ্য ও ডেলিভারি ঠিকানা:
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
                      {order.deliveryAddress.fullName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <Phone size={15} style={{ color: 'var(--color-primary)' }} />
                      <a
                        href={`tel:${order.deliveryAddress.phone}`}
                        style={{ fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}
                      >
                        {order.deliveryAddress.phone}
                      </a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text)' }}>
                      <MapPin size={16} style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        {order.deliveryAddress.address}, {order.deliveryAddress.city}, {order.deliveryAddress.district}
                        {order.deliveryAddress.deliveryNotes && (
                          <div style={{ fontSize: '0.8rem', color: '#b45309', background: '#fef3c7', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', marginTop: '0.25rem' }}>
                            নোট: {order.deliveryAddress.deliveryNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
                      অর্ডারের পণ্য ({order.items.length} টি):
                    </div>
                    <div style={{ background: 'var(--color-surface-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-md)', maxHeight: '120px', overflowY: 'auto' }}>
                      {order.items.map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.2rem 0' }}>
                          <span>{it.nameBn || it.name} &times; {it.quantity} {it.unit}</span>
                          <span style={{ fontWeight: 600 }}>৳{it.total}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary)' }}>
                      <span>ক্যাশ অন ডেলিভারি (সংগ্রহযোগ্য):</span>
                      <span style={{ fontSize: '1.2rem' }}>৳{order.total}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'var(--color-surface-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  {order.status === 'assigned' && (
                    <button
                      className="btn btn-primary btn-md"
                      disabled={actionLoadingId === order.id}
                      onClick={() => handleStartDelivery(order.id)}
                      style={{ gap: '0.5rem' }}
                    >
                      <Navigation size={18} />
                      <span>{actionLoadingId === order.id ? 'শুরু হচ্ছে...' : 'ডেলিভারি শুরু করুন (Start Delivery)'}</span>
                    </button>
                  )}

                  {order.status === 'out_for_delivery' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontSize: '0.85rem', fontWeight: 700 }}>
                        <span className="status-indicator-dot status-dot-available" />
                        <span>লাইভ জিপিএস লোকেশন শেয়ার হচ্ছে</span>
                      </div>

                      <button
                        className="btn btn-success btn-md"
                        disabled={actionLoadingId === order.id}
                        onClick={() => handleMarkHandedOver(order.id)}
                        style={{ gap: '0.5rem' }}
                      >
                        <CheckCircle size={18} />
                        <span>{actionLoadingId === order.id ? 'আপডেট হচ্ছে...' : 'পণ্য হস্তান্তর সম্পন্ন করুন (Mark Handed Over)'}</span>
                      </button>
                    </div>
                  )}

                  {order.status === 'handed_over' && (
                    <div style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} />
                      <span>পণ্যটি হস্তান্তর করা হয়েছে। গ্রাহক রিসিভ নিশ্চিত করলেই আপনার ওয়ালেটে আয় যুক্ত হবে।</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a
                      href={`tel:${order.deliveryAddress.phone}`}
                      className="btn btn-outline btn-sm"
                      style={{ gap: '0.4rem' }}
                    >
                      <Phone size={14} />
                      <span>কল করুন</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
