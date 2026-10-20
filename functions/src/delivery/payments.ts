import * as admin from 'firebase-admin';
import { RecordPaymentRequest } from '../types';

/**
 * Record an actual payment made to a delivery person (Admin Only)
 */
export async function handleRecordDeliveryPayment(req: RecordPaymentRequest, adminUid: string) {
  const db = admin.firestore();

  if (!req.deliveryPersonId || req.amount <= 0) {
    throw new Error('Valid delivery person and positive payment amount are required.');
  }

  const deliveryPersonRef = db.collection('deliveryProfiles').doc(req.deliveryPersonId);
  const paymentRef = db.collection('deliveryPayments').doc(`pay_${Date.now()}`);

  return await db.runTransaction(async (transaction) => {
    const deliveryDoc = await transaction.get(deliveryPersonRef);
    if (!deliveryDoc.exists) {
      throw new Error('Delivery person not found.');
    }

    const dData = deliveryDoc.data()!;
    const outstanding = dData.outstandingPayableAmount || 0;

    if (req.amount > outstanding) {
      throw new Error(`Payment amount (৳${req.amount}) exceeds outstanding balance (৳${outstanding}).`);
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const nowIso = new Date().toISOString();

    // 1. Create payment record
    transaction.set(paymentRef, {
      id: paymentRef.id,
      deliveryPersonId: req.deliveryPersonId,
      deliveryPersonName: dData.name || 'Agent',
      amount: req.amount,
      paymentDate: nowIso,
      paymentMethod: req.paymentMethod || 'bKash',
      transactionReference: req.transactionReference || '',
      notes: req.notes || '',
      ledgerEntryIds: req.ledgerEntryIds || [],
      status: 'paid',
      recordedBy: adminUid,
      createdAt: now
    });

    // 2. Mark covered ledger entries as paid
    if (req.ledgerEntryIds && req.ledgerEntryIds.length > 0) {
      for (const entryId of req.ledgerEntryIds) {
        const entryRef = db.collection('deliveryEarnings').doc(entryId);
        transaction.update(entryRef, {
          status: 'paid',
          paymentId: paymentRef.id
        });
      }
    }

    // 3. Update delivery person profile balance
    const newPaid = (dData.totalPaidAmount || 0) + req.amount;
    const newOutstanding = Math.max(0, outstanding - req.amount);

    transaction.update(deliveryPersonRef, {
      totalPaidAmount: newPaid,
      outstandingPayableAmount: newOutstanding,
      updatedAt: now
    });

    return {
      success: true,
      paymentId: paymentRef.id,
      amount: req.amount,
      newOutstanding
    };
  });
}
