import * as admin from 'firebase-admin';
import { ConfirmReceiptRequest, ReportIssueRequest } from '../types';

/**
 * Customer confirms receipt of order.
 * - Enforces owner authorization
 * - Idempotently creates permanent order archive snapshot
 * - Generates delivery earnings ledger entry exactly once
 * - Updates delivery person profile earnings & availability
 */
export async function handleConfirmCustomerReceipt(req: ConfirmReceiptRequest, customerUid: string) {
  const db = admin.firestore();
  const orderRef = db.collection('orders').doc(req.orderId);
  const archiveRef = db.collection('orderArchives').doc(req.orderId);
  const earningsRef = db.collection('deliveryEarnings').doc(`earn_${req.orderId}`);

  return await db.runTransaction(async (transaction) => {
    const orderDoc = await transaction.get(orderRef);
    if (!orderDoc.exists) {
      throw new Error('Order not found.');
    }

    const orderData = orderDoc.data()!;
    if (orderData.userId !== customerUid) {
      throw new Error('Unauthorized: You can only confirm receipt for your own orders.');
    }

    // Check if already confirmed / archived (Idempotency guarantee)
    const existingArchive = await transaction.get(archiveRef);
    if (existingArchive.exists || orderData.status === 'receipt_confirmed') {
      return { success: true, orderId: req.orderId, alreadyConfirmed: true };
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const nowIso = new Date().toISOString();

    const newStatusHistory = [
      ...(orderData.statusHistory || []),
      {
        status: 'receipt_confirmed',
        timestamp: nowIso,
        note: 'গ্রাহক পণ্য গ্রহণের বিষয়টি নিশ্চিত করেছেন।'
      }
    ];

    // 1. Update order status
    transaction.update(orderRef, {
      status: 'receipt_confirmed',
      receiptConfirmedAt: now,
      paymentStatus: 'paid', // Cash on Delivery fulfilled
      statusHistory: newStatusHistory,
      isArchived: true,
      updatedAt: now
    });

    // 2. Create permanent immutable order archive snapshot
    transaction.set(archiveRef, {
      id: req.orderId,
      orderId: req.orderId,
      orderNumber: orderData.orderNumber || req.orderId,
      userId: customerUid,
      userEmail: orderData.userEmail || '',
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      discount: orderData.discount || 0,
      deliveryFee: orderData.deliveryFee || 0,
      total: orderData.total || 0,
      currency: orderData.currency || 'BDT',
      paymentMethod: orderData.paymentMethod || 'cod',
      paymentStatus: 'paid',
      deliveryAddress: orderData.deliveryAddress || {},
      deliveryPersonInternalId: orderData.assignedDeliveryPersonId || '',
      deliveryPersonName: orderData.assignedDeliveryPersonName || 'Direct Store Delivery',
      orderDate: orderData.createdAt || now,
      handoverTimestamp: orderData.handedOverAt || now,
      receiptConfirmedTimestamp: now,
      archivedAt: now,
      isRated: false
    });

    // 3. Process delivery earnings ledger if a delivery person was assigned
    const deliveryPersonId = orderData.assignedDeliveryPersonId;
    if (deliveryPersonId) {
      const deliveryPersonRef = db.collection('deliveryProfiles').doc(deliveryPersonId);
      const deliveryDoc = await transaction.get(deliveryPersonRef);

      // Standard delivery fee earned by delivery person (e.g. from order delivery fee, minimum ৳50)
      const earnedAmount = orderData.deliveryFee || 60;

      // Create ledger entry (Idempotent: doc ID is `earn_${orderId}`)
      transaction.set(earningsRef, {
        id: `earn_${req.orderId}`,
        orderId: req.orderId,
        orderNumber: orderData.orderNumber || req.orderId,
        deliveryPersonId,
        deliveryPersonName: orderData.assignedDeliveryPersonName || 'Agent',
        amount: earnedAmount,
        currency: 'BDT',
        status: 'eligible',
        earnedAt: now
      });

      if (deliveryDoc.exists) {
        const dData = deliveryDoc.data()!;
        const completed = (dData.totalCompletedDeliveries || 0) + 1;
        const totalEarned = (dData.totalEarnedDeliveryCharge || 0) + earnedAmount;
        const outstanding = (dData.outstandingPayableAmount || 0) + earnedAmount;
        const currentActive = Math.max(0, (dData.currentActiveDeliveries || 1) - 1);

        transaction.update(deliveryPersonRef, {
          totalCompletedDeliveries: completed,
          totalEarnedDeliveryCharge: totalEarned,
          outstandingPayableAmount: outstanding,
          currentActiveDeliveries: currentActive,
          availability: currentActive === 0 ? 'available' : dData.availability,
          currentActiveOrderId: currentActive === 0 ? null : dData.currentActiveOrderId,
          updatedAt: now
        });
      }

      // Update assignment record status
      const assignmentRef = db.collection('deliveryAssignments').doc(req.orderId);
      transaction.set(assignmentRef, {
        status: 'receipt_confirmed',
        receiptConfirmedAt: now
      }, { merge: true });

      // Clean up location session
      const locationRef = db.collection('deliveryLocations').doc(req.orderId);
      transaction.set(locationRef, {
        status: 'ended',
        timestamp: now
      }, { merge: true });
    }

    return { success: true, orderId: req.orderId };
  });
}

/**
 * Customer reports an issue with their delivery
 */
export async function handleReportDeliveryIssue(req: ReportIssueRequest, customerUid: string) {
  const db = admin.firestore();
  const orderRef = db.collection('orders').doc(req.orderId);

  return await db.runTransaction(async (transaction) => {
    const orderDoc = await transaction.get(orderRef);
    if (!orderDoc.exists) {
      throw new Error('Order not found.');
    }

    const orderData = orderDoc.data()!;
    if (orderData.userId !== customerUid) {
      throw new Error('Unauthorized.');
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const nowIso = new Date().toISOString();

    const newStatusHistory = [
      ...(orderData.statusHistory || []),
      {
        status: 'delivery_issue',
        timestamp: nowIso,
        note: `গ্রাহক ডেলিভারি সম্পর্কিত সমস্যা রিপোর্ট করেছেন: ${req.description}`
      }
    ];

    transaction.update(orderRef, {
      status: 'delivery_issue',
      deliveryIssueReported: true,
      deliveryIssueDetails: req.description,
      statusHistory: newStatusHistory,
      updatedAt: now
    });

    const issueRef = db.collection('deliveryIssues').doc(`issue_${req.orderId}_${Date.now()}`);
    transaction.set(issueRef, {
      id: issueRef.id,
      orderId: req.orderId,
      orderNumber: orderData.orderNumber || req.orderId,
      userId: customerUid,
      customerName: orderData.deliveryAddress?.fullName || 'Customer',
      customerPhone: orderData.deliveryAddress?.phone || '',
      deliveryPersonId: orderData.assignedDeliveryPersonId || null,
      deliveryPersonName: orderData.assignedDeliveryPersonName || null,
      issueType: req.issueType || 'other',
      description: req.description,
      status: 'open',
      createdAt: now
    });

    return { success: true, orderId: req.orderId };
  });
}
