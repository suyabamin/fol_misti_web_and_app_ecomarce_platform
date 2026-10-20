import React, { useEffect, useState } from 'react';
import {
  Wallet,
  DollarSign,
  PlusCircle,
  CheckCircle2,
  Receipt,
  Search,
  Filter,
  X,
  AlertCircle
} from 'lucide-react';
import { deliveryRepository } from '../../repositories/deliveryRepository';
import { DeliveryProfile, DeliveryPayment, DeliveryEarningsEntry } from '../../models';

export const AdminDeliveryPaymentsPage: React.FC = () => {
  const [profiles, setProfiles] = useState<DeliveryProfile[]>([]);
  const [payments, setPayments] = useState<DeliveryPayment[]>([]);
  const [earnings, setEarnings] = useState<DeliveryEarningsEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [selectedRiderId, setSelectedRiderId] = useState<string>('all');

  // Record Payment Modal State
  const [showModal, setShowModal] = useState(false);
  const [targetRiderId, setTargetRiderId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<DeliveryPayment['paymentMethod']>('bKash');
  const [trxRef, setTrxRef] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profList, payList, earnList] = await Promise.all([
        deliveryRepository.getDeliveryProfiles(),
        deliveryRepository.getAllPayments(),
        deliveryRepository.getAllEarnings()
      ]);
      setProfiles(profList);
      setPayments(payList);
      setEarnings(earnList);
      if (profList.length > 0 && !targetRiderId) {
        setTargetRiderId(profList[0].uid);
        setPaymentAmount(profList[0].outstandingPayableAmount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRiderSelectInModal = (uid: string) => {
    setTargetRiderId(uid);
    const p = profiles.find(x => x.uid === uid || x.id === uid);
    if (p) {
      setPaymentAmount(p.outstandingPayableAmount || 0);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const rider = profiles.find(x => x.uid === targetRiderId || x.id === targetRiderId);
    if (!rider) {
      setErrorMsg('রাইডার নির্বাচন করুন।');
      return;
    }

    if (paymentAmount <= 0) {
      setErrorMsg('পেমেন্ট পরিমাণ অবশ্যই শূন্যের চেয়ে বেশি হতে হবে।');
      return;
    }

    if (paymentAmount > (rider.outstandingPayableAmount || 0)) {
      setErrorMsg(`পেমেন্টের পরিমাণ বকেয়া ব্যালেন্সের (৳${rider.outstandingPayableAmount}) চেয়ে বেশি হতে পারবে না।`);
      return;
    }

    setSubmitting(true);
    try {
      await deliveryRepository.recordPayment(
        targetRiderId,
        paymentAmount,
        paymentMethod,
        trxRef,
        notes,
        'admin'
      );
      setSuccessMsg('ডেলিভারি পেমেন্ট সফলভাবে লেজারে রেকর্ড করা হয়েছে!');
      setShowModal(false);
      setTrxRef('');
      setNotes('');
      await loadData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'পেমেন্ট রেকর্ড সম্পন্ন করা যায়নি।');
    } finally {
      setSubmitting(false);
    }
  };

  const totalEarnedAll = profiles.reduce((sum, p) => sum + (p.totalEarnedDeliveryCharge || 0), 0);
  const totalPaidAll = profiles.reduce((sum, p) => sum + (p.totalPaidAmount || 0), 0);
  const totalOutstandingAll = profiles.reduce((sum, p) => sum + (p.outstandingPayableAmount || 0), 0);

  const filteredPayments = selectedRiderId === 'all'
    ? payments
    : payments.filter(p => p.deliveryPersonId === selectedRiderId);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
            ডেলিভারি পেমেন্ট ও লেজার ব্যবস্থাপনা 💳
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            রাইডারদের অর্জিত ডেলিভারি ফি এবং অ্যাডমিন কর্তৃক পরিশোধিত পেমেন্ট ট্র্যাকিং
          </p>
        </div>

        <button
          onClick={() => { setShowModal(true); setErrorMsg(null); }}
          className="btn btn-primary btn-md"
          style={{ gap: '0.5rem' }}
        >
          <PlusCircle size={18} />
          <span>পেমেন্ট রেকর্ড করুন</span>
        </button>
      </div>

      {successMsg && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>মোট অর্জিত চার্জ (সবাই)</span>
            <DollarSign size={20} style={{ color: '#16a34a' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#16a34a' }}>
            ৳{totalEarnedAll}
          </div>
        </div>

        <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>মোট পরিশোধিত পেমেন্ট</span>
            <CheckCircle2 size={20} style={{ color: '#2563eb' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#2563eb' }}>
            ৳{totalPaidAll}
          </div>
        </div>

        <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>মোট প্রদেয় বকেয়া ব্যালেন্স</span>
            <Wallet size={20} style={{ color: '#b45309' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#b45309' }}>
            ৳{totalOutstandingAll}
          </div>
        </div>
      </div>

      {/* Filter by Rider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={16} />
          <span>রাইডার অনুযায়ী ফিল্টার:</span>
        </div>
        <select
          className="form-select"
          value={selectedRiderId}
          onChange={(e) => setSelectedRiderId(e.target.value)}
          style={{ width: '250px' }}
        >
          <option value="all">সকল রাইডার ({profiles.length})</option>
          {profiles.map(p => (
            <option key={p.id} value={p.uid}>
              {p.name} (বকেয়া: ৳{p.outstandingPayableAmount || 0})
            </option>
          ))}
        </select>
      </div>

      {/* Payments History Table */}
      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)', fontWeight: 800, fontSize: '1.1rem' }}>
          পরিশোধিত পেমেন্ট রেকর্ডসমূহ ({filteredPayments.length})
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>পেমেন্ট ডাটা লোড হচ্ছে...</div>
        ) : filteredPayments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি।
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem' }}>তারিখ</th>
                  <th style={{ padding: '1rem' }}>ডেলিভারি রাইডার</th>
                  <th style={{ padding: '1rem' }}>পেমেন্ট মাধ্যম</th>
                  <th style={{ padding: '1rem' }}>ট্রানজেকশন আইডি (TrxID)</th>
                  <th style={{ padding: '1rem' }}>পরিমাণ</th>
                  <th style={{ padding: '1rem' }}>নোট</th>
                  <th style={{ padding: '1rem' }}>রেকর্ডকারী</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((pay) => (
                  <tr key={pay.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                      {new Date(pay.paymentDate).toLocaleDateString('bn-BD')}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>
                      {pay.deliveryPersonName}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-subtle">{pay.paymentMethod}</span>
                    </td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {pay.transactionReference || 'N/A'}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 800, color: '#16a34a', fontSize: '1rem' }}>
                      ৳{pay.amount}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      {pay.notes || '-'}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {pay.recordedBy || 'admin'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECORD PAYMENT MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--color-surface)', maxWidth: '480px', width: '100%', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                ডেলিভারি ফি পেমেন্ট রেকর্ড করুন 💳
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRecordPayment}>
              {/* Select Rider */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">ডেলিভারি কর্মী নির্বাচন</label>
                <select
                  className="form-select"
                  value={targetRiderId}
                  onChange={(e) => handleRiderSelectInModal(e.target.value)}
                  required
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.uid}>
                      {p.name} (বকেয়া: ৳{p.outstandingPayableAmount || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">পেমেন্টের পরিমাণ (টাকা)</label>
                <input
                  type="number"
                  className="form-input"
                  min={1}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  required
                />
              </div>

              {/* Method */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">পেমেন্ট মেথড (প্রকৃত পরিশোধের মাধ্যম)</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                >
                  <option value="bKash">বিকাশ (bKash)</option>
                  <option value="Nagad">নগদ (Nagad)</option>
                  <option value="Bank Transfer">ব্যাংক ট্রান্সফার</option>
                  <option value="Cash">ক্যাশ / নগদ প্রদান</option>
                </select>
              </div>

              {/* Trx ID */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">ট্রানজেকশন আইডি / রেফারেন্স নম্বর</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="যেমন: 9J3K82LA หรือ রশিদ নং"
                  value={trxRef}
                  onChange={(e) => setTrxRef(e.target.value)}
                  required
                />
              </div>

              {/* Notes */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">মন্তব্য / নোট (ঐচ্ছিক)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="যেমন: মে মাসের ১ম সপ্তাহের ডেলিভারি ক্লিয়ারেন্স"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  বাতিল
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'সংরক্ষণ হচ্ছে...' : 'পেমেন্ট কনফার্ম করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
