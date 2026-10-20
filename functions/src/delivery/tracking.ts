import * as admin from 'firebase-admin';
import { UpdateLocationRequest } from '../types';

/**
 * Start an assigned delivery (sets status to out_for_delivery)
 */
export async function handleStartDelivery(orderId: string, deliveryPersonUid: string) {
  const db = admin.firestore();
  const orderRef = db.collection('orders').doc(orderId);

  return await db.runTransaction(async (transaction) => {
    const orderDoc = await transaction.get(orderRef);
    if (!orderDoc.exists) {
      throw new Error('Order not found.');
    }

    const orderData = orderDoc.data()!;
    if (orderData.assignedDeliveryPersonId !== deliveryPersonUid) {
      throw new Error('You are not authorized to start delivery for this order.');
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const nowIso = new Date().toISOString();

    const newStatusHistory = [
      ...(orderData.statusHistory || []),
      {
        status: 'out_for_delivery',
        timestamp: nowIso,
        note: 'ডেলিভারি পার্সন পণ্য নিয়ে আপনার ঠিকানার দিকে রওনা হয়েছেন।'
      }
    ];

    transaction.update(orderRef, {
      status: 'out_for_delivery',
      startedAt: now,
      statusHistory: newStatusHistory,
      updatedAt: now
    });

    // Update assignment record
    const assignmentRef = db.collection('deliveryAssignments').doc(orderId);
    transaction.set(assignmentRef, {
      status: 'out_for_delivery',
      startedAt: now
    }, { merge: true });

    // Update location tracking state
    const locationRef = db.collection('deliveryLocations').doc(orderId);
    transaction.set(locationRef, {
      orderId,
      deliveryPersonId: deliveryPersonUid,
      status: 'live',
      timestamp: now
    }, { merge: true });

    return { success: true, orderId, status: 'out_for_delivery' };
  });
}

/**
 * Update delivery GPS coordinates (Delivery Person Only)
 */
export async function handleUpdateLocation(req: UpdateLocationRequest, deliveryPersonUid: string) {
  const db = admin.firestore();

  // Validate coordinates
  if (
    typeof req.latitude !== 'number' ||
    typeof req.longitude !== 'number' ||
    req.latitude < -90 ||
    req.latitude > 90 ||
    req.longitude < -180 ||
    req.longitude > 180
  ) {
    throw new Error('Invalid GPS coordinates provided.');
  }

  const orderRef = db.collection('orders').doc(req.orderId);
  const orderDoc = await orderRef.get();

  if (!orderDoc.exists) {
    throw new Error('Order not found.');
  }

  const orderData = orderDoc.data()!;
  if (orderData.assignedDeliveryPersonId !== deliveryPersonUid) {
    throw new Error('Unauthorized: You are not the assigned delivery person for this order.');
  }

  if (orderData.status !== 'out_for_delivery') {
    throw new Error(`Location updates only accepted while order is out_for_delivery (current: ${orderData.status}).`);
  }

  const now = admin.firestore.FieldValue.serverTimestamp();

  const locationRef = db.collection('deliveryLocations').doc(req.orderId);
  await locationRef.set({
    orderId: req.orderId,
    deliveryPersonId: deliveryPersonUid,
    latitude: req.latitude,
    longitude: req.longitude,
    heading: req.heading ?? null,
    speed: req.speed ?? null,
    accuracy: req.accuracy ?? null,
    status: 'live',
    timestamp: now
  });

  return { success: true, orderId: req.orderId };
}

/**
 * Mark order as handed over to customer (Delivery Person Only)
 * NOTE: Handover does NOT count as customer receipt confirmation.
 */
export async function handleMarkHandedOver(orderId: string, deliveryPersonUid: string) {
  const db = admin.firestore();
  const orderRef = db.collection('orders').doc(orderId);

  return await db.runTransaction(async (transaction) => {
    const orderDoc = await transaction.get(orderRef);
    if (!orderDoc.exists) {
      throw new Error('Order not found.');
    }

    const orderData = orderDoc.data()!;
    if (orderData.assignedDeliveryPersonId !== deliveryPersonUid) {
      throw new Error('You are not authorized to mark handover for this order.');
    }

    if (orderData.status === 'receipt_confirmed' || orderData.status === 'delivered') {
      throw new Error('Order has already been confirmed.');
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const nowIso = new Date().toISOString();

    const newStatusHistory = [
      ...(orderData.statusHistory || []),
      {
        status: 'handed_over',
        timestamp: nowIso,
        note: 'ডেলিভারি পার্সন পণ্য গ্রাহকের নিকট হস্তান্তর করেছেন। গ্রাহকের নিশ্চিতকরণের অপেক্ষা।'
      }
    ];

    transaction.update(orderRef, {
      status: 'handed_over',
      handedOverAt: now,
      statusHistory: newStatusHistory,
      updatedAt: now
    });

    // Update assignment record
    const assignmentRef = db.collection('deliveryAssignments').doc(orderId);
    transaction.set(assignmentRef, {
      status: 'handed_over',
      handedOverAt: now
    }, { merge: true });

    // Mark location tracking ended
    const locationRef = db.collection('deliveryLocations').doc(orderId);
    transaction.set(locationRef, {
      status: 'ended',
      timestamp: now
    }, { merge: true });

    return { success: true, orderId, status: 'handed_over' };
  });
}
