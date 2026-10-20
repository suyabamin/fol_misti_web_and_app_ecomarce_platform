import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Wallet,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Receipt
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deliveryRepository } from '../../repositories/deliveryRepository';
import { DeliveryProfile, DeliveryEarningsEntry, DeliveryPayment } from '../../models';

interface ContextType {
  profile: DeliveryProfile | null;
  reloadProfile: () => void;
}

export const DeliveryEarningsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { profile } = useOutletContext<ContextType>();
  const [earnings, setEarnings] = useState<DeliveryEarningsEntry[]>([]);
  const [payments, setPayments] = useState<DeliveryPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const riderUid = currentUser?.uid || 'delivery-agent-1';

  useEffect(() => {
    loadLedger();
  }, [riderUid]);

  const loadLedger = async () => {
    setLoading(true);
    try {
      const [eList, pList] = await Promise.all([
        deliveryRepository.getEarningsForAgent(riderUid),
        deliveryRepository.getPaymentsForAgent(riderUid)
      ]);
      setEarnings(eList);
      setPayments(pList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalEarned = profile?.totalEarnedDeliveryCharge || 0;
  const totalPaid = profile?.totalPaidAmount || 0;
  const outstanding = profile?.outstandingPayableAmount || 0;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
          ডেলিভারি আয় ও পেমেন্ট লেজার 💰
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          আপনার অর্জিত ডেলিভারি চার্জ, বকেয়া পাওনা এবং অ্যাডমিন কর্তৃক পরিশোধিত পেমেন্ট হিস্ট্রি
        </p>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>মোট অর্জিত ডেলিভারি ফি</span>
            <div style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', padding: '0.4rem', borderRadius: 'var(--radius-md)' }}>
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#16a34a' }}>
            ৳{totalEarned}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            {profile?.totalCompletedDeliveries || 0} টি সফল ডেলিভারি থেকে
          </div>
        </div>

        <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>পরিশোধিত পেমেন্ট (Paid)</span>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.4rem', borderRadius: 'var(--radius-md)' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#3b82f6' }}>
            ৳{totalPaid}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            বিকাশ/নগদ/ব্যাংকের মাধ্যমে উত্তোলিত
          </div>
        </div>

        <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>বর্তমান বকেয়া পাওনা</span>
            <div style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', padding: '0.4rem', borderRadius: 'var(--radius-md)' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#b45309' }}>
            ৳{outstanding}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            অ্যাডমিন অফিস থেকে প্রদেয় অবশিষ্ট ব্যালেন্স
          </div>
        </div>
      </div>

      {/* Grid: Ledger Entries and Payouts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Earnings Ledger */}
        <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={18} style={{ color: 'var(--color-primary)' }} />
            <span>ডেলিভারি চার্জ লেজার</span>
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>লোড হচ্ছে...</div>
          ) : earnings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              এখনো কোনো লেজার এন্ট্রি তৈরি হয়নি।
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {earnings.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.85rem',
                    background: 'var(--color-surface-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                      অর্ডার #{entry.orderNumber}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(entry.earnedAt).toLocaleDateString('bn-BD')}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#16a34a' }}>
                      +৳{entry.amount}
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.4rem',
                        borderRadius: 'var(--radius-full)',
                        background: entry.status === 'paid' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                        color: entry.status === 'paid' ? '#2563eb' : '#b45309'
                      }}
                    >
                      {entry.status === 'paid' ? 'পরিশোধিত' : 'প্রাপ্য (Eligible)'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payout History */}
        <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Receipt size={18} style={{ color: '#3b82f6' }} />
            <span>অ্যাডমিন কর্তৃক পেমেন্ট রশিদ</span>
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>লোড হচ্ছে...</div>
          ) : payments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              এখনো কোনো পরিশোধিত পেমেন্ট রেকর্ড নেই।
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {payments.map((pay) => (
                <div
                  key={pay.id}
                  style={{
                    padding: '0.85rem',
                    background: 'var(--color-surface-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                      {pay.paymentMethod} ট্রানজেকশন
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: '#2563eb' }}>
                      ৳{pay.amount}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>TrxID: {pay.transactionReference || 'N/A'}</span>
                    <span>{new Date(pay.paymentDate).toLocaleDateString('bn-BD')}</span>
                  </div>

                  {pay.notes && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                      নোট: {pay.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
