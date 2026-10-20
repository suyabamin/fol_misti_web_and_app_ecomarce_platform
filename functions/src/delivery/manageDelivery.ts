import * as admin from 'firebase-admin';
import { AssignDeliveryRequest, DeliverySchedule } from '../types';

/**
 * Promote an existing user to delivery person or create their profile
 */
export async function handleSetDeliveryRole(
  targetUid: string,
  profileData: {
    name: string;
    phone: string;
    email: string;
    schedule?: Partial<DeliverySchedule>;
    vehicleType?: 'bicycle' | 'motorbike' | 'van' | 'walking';
    vehiclePlateNumber?: string;
  }
) {
  const db = admin.firestore();

  const userRef = db.collection('users').doc(targetUid);
  const userSnap = await userRef.get();

  const email = profileData.email || userSnap.data()?.email || '';
  const name = profileData.name || userSnap.data()?.displayName || 'Delivery Person';
  const phone = profileData.phone || userSnap.data()?.phone || '';

  // Default schedule: Mon-Sun 9am - 7pm, 2 max active deliveries
  const defaultSchedule: DeliverySchedule = {
    workingDays: [0, 1, 2, 3, 4, 5, 6],
    startTime: '09:00',
    endTime: '19:00',
    breakStartTime: '13:00',
    breakEndTime: '14:00',
    isLeaveToday: false,
    maxActiveDeliveries: 2,
    ...(profileData.schedule || {})
  };

  const deliveryProfileRef = db.collection('deliveryProfiles').doc(targetUid);
  const existingDeliverySnap = await deliveryProfileRef.get();

  const now = admin.firestore.FieldValue.serverTimestamp();

  await db.runTransaction(async (transaction) => {
    // 1. Update user role in users collection
    if (userSnap.exists) {
      transaction.update(userRef, {
        role: 'delivery',
        phone: phone || userSnap.data()?.phone || '',
        updatedAt: now
      });
    } else {
      transaction.set(userRef, {
        uid: targetUid,
        email,
        displayName: name,
        phone,
        role: 'delivery',
        createdAt: now,
        updatedAt: now
      });
    }

    // 2. Create or update deliveryProfiles document
    if (existingDeliverySnap.exists) {
      transaction.update(deliveryProfileRef, {
        name,
        phone,
        email,
        schedule: defaultSchedule,
        vehicleType: profileData.vehicleType || existingDeliverySnap.data()?.vehicleType || 'motorbike',
        vehiclePlateNumber: profileData.vehiclePlateNumber || existingDeliverySnap.data()?.vehiclePlateNumber || '',
        updatedAt: now
      });
    } else {
      transaction.set(deliveryProfileRef, {
        id: targetUid,
        uid: targetUid,
        name,
        phone,
        email,
        status: 'active',
        availability: 'available',
        currentActiveDeliveries: 0,
        currentActiveOrderId: null,
        schedule: defaultSchedule,
        vehicleType: profileData.vehicleType || 'motorbike',
        vehiclePlateNumber: profileData.vehiclePlateNumber || '',
        totalCompletedDeliveries: 0,
        totalEarnedDeliveryCharge: 0,
        totalPaidAmount: 0,
        outstandingPayableAmount: 0,
        createdAt: now,
        updatedAt: now
      });
    }
  });

  return { success: true, uid: targetUid, role: 'delivery' };
}

/**
 * Assign or reassign an order to an eligible delivery person
 */
export async function handleAssignDeliveryPerson(
  req: AssignDeliveryRequest,
  adminUid: string
) {
  const db = admin.firestore();
  const orderRef = db.collection('orders').doc(req.orderId);
  const deliveryPersonRef = db.collection('deliveryProfiles').doc(req.deliveryPersonId);

  return await db.runTransaction(async (transaction) => {
    const orderDoc = await transaction.get(orderRef);
    if (!orderDoc.exists) {
      throw new Error('Order not found.');
    }

    const orderData = orderDoc.data()!;
    if (orderData.status === 'cancelled' || orderData.status === 'receipt_confirmed') {
      throw new Error(`Cannot assign order with status: ${orderData.status}`);
    }

    const deliveryDoc = await transaction.get(deliveryPersonRef);
    if (!deliveryDoc.exists) {
      throw new Error('Delivery person profile not found.');
    }

    const deliveryData = deliveryDoc.data()!;
    if (deliveryData.status !== 'active') {
      throw new Error('Delivery person account is suspended or inactive.');
    }

    if (deliveryData.availability === 'unavailable' || deliveryData.availability === 'on_break') {
      throw new Error(`Delivery person is currently ${deliveryData.availability}.`);
    }

    const maxDeliveries = deliveryData.schedule?.maxActiveDeliveries || 2;
    if (deliveryData.currentActiveDeliveries >= maxDeliveries) {
      throw new Error(`Delivery person has reached maximum active delivery limit (${maxDeliveries}).`);
    }

    const previousDeliveryPersonId = orderData.assignedDeliveryPersonId;
    const isReassignment = Boolean(previousDeliveryPersonId && previousDeliveryPersonId !== req.deliveryPersonId);

    const now = admin.firestore.FieldValue.serverTimestamp();
    const nowIso = new Date().toISOString();

    // If reassigning, handle previous delivery person workload and tracking session
    if (isReassignment) {
      const prevDeliveryRef = db.collection('deliveryProfiles').doc(previousDeliveryPersonId);
      const prevDoc = await transaction.get(prevDeliveryRef);
      if (prevDoc.exists) {
        const prevActive = Math.max(0, (prevDoc.data()?.currentActiveDeliveries || 1) - 1);
        transaction.update(prevDeliveryRef, {
          currentActiveDeliveries: prevActive,
          availability: prevActive === 0 ? 'available' : prevDoc.data()?.availability,
          updatedAt: now
        });
      }

      // Terminate old location tracking session
      const locationRef = db.collection('deliveryLocations').doc(req.orderId);
      transaction.set(locationRef, {
        status: 'ended',
        timestamp: now
      }, { merge: true });
    }

    // Update order with assignment details
    const newStatusHistory = [
      ...(orderData.statusHistory || []),
      {
        status: 'assigned',
        timestamp: nowIso,
        note: isReassignment
          ? `Reassigned to ${deliveryData.name}. Reason: ${req.reason || 'Admin reallocated'}`
          : `Assigned to delivery person: ${deliveryData.name}`
      }
    ];

    transaction.update(orderRef, {
      assignedDeliveryPersonId: req.deliveryPersonId,
      assignedDeliveryPersonName: deliveryData.name,
      assignedDeliveryPersonPhone: deliveryData.phone,
      deliveryAssignedAt: now,
      status: orderData.status === 'pending' || orderData.status === 'preparing' ? 'assigned' : orderData.status,
      statusHistory: newStatusHistory,
      updatedAt: now
    });

    // Update new delivery person profile
    const newActive = (deliveryData.currentActiveDeliveries || 0) + 1;
    transaction.update(deliveryPersonRef, {
      currentActiveDeliveries: newActive,
      availability: 'in_order',
      currentActiveOrderId: req.orderId,
      updatedAt: now
    });

    // Create / update deliveryAssignments document
    const assignmentRef = db.collection('deliveryAssignments').doc(req.orderId);
    const existingAssignment = await transaction.get(assignmentRef);

    const reassignmentItem = isReassignment ? {
      previousDeliveryPersonId,
      previousDeliveryPersonName: orderData.assignedDeliveryPersonName || 'Previous Agent',
      reason: req.reason || 'Operational adjustment',
      timestamp: nowIso,
      reassignedBy: adminUid
    } : null;

    const existingHistory = existingAssignment.exists ? existingAssignment.data()?.reassignmentHistory || [] : [];
    if (reassignmentItem) {
      existingHistory.push(reassignmentItem);
    }

    transaction.set(assignmentRef, {
      id: req.orderId,
      orderId: req.orderId,
      orderNumber: orderData.orderNumber || req.orderId,
      deliveryPersonId: req.deliveryPersonId,
      deliveryPersonName: deliveryData.name,
      deliveryPersonPhone: deliveryData.phone,
      customerName: orderData.deliveryAddress?.fullName || 'Customer',
      customerPhone: orderData.deliveryAddress?.phone || '',
      deliveryAddress: orderData.deliveryAddress || {},
      status: 'assigned',
      deliveryFee: orderData.deliveryFee || 0,
      assignedAt: now,
      assignedBy: adminUid,
      reassignmentHistory: existingHistory
    }, { merge: true });

    return {
      success: true,
      orderId: req.orderId,
      deliveryPersonId: req.deliveryPersonId,
      deliveryPersonName: deliveryData.name
    };
  });
}
