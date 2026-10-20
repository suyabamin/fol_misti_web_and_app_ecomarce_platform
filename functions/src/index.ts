import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { handleCreateOrder } from './orders/createOrder';
import { handleCancelOrder } from './orders/cancelOrder';
import { handleValidateCoupon } from './coupons/validateCoupon';
import { handlePublishTheme } from './theme/publishTheme';
import { handleSetAdminRole } from './admin/setAdminRole';
import { handleSetDeliveryRole, handleAssignDeliveryPerson } from './delivery/manageDelivery';
import { handleStartDelivery, handleUpdateLocation, handleMarkHandedOver } from './delivery/tracking';
import { handleConfirmCustomerReceipt, handleReportDeliveryIssue } from './delivery/receiptAndArchive';
import { handleRecordDeliveryPayment } from './delivery/payments';
import {
  CreateOrderRequest,
  ThemeId,
  AssignDeliveryRequest,
  UpdateLocationRequest,
  ConfirmReceiptRequest,
  ReportIssueRequest,
  RecordPaymentRequest
} from './types';

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Callable function to securely create an order with atomic stock reduction
 */
export const createOrder = functions.https.onCall(async (data: CreateOrderRequest, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'অর্ডার করার জন্য লগইন করা আবশ্যক।'
    );
  }

  try {
    const result = await handleCreateOrder(data, context.auth.uid, context.auth.token.email);
    return { success: true, ...result };
  } catch (error: any) {
    console.error('Error creating order:', error);
    throw new functions.https.HttpsError('invalid-argument', error.message || 'অর্ডার সম্পন্ন করতে সমস্যা হয়েছে।');
  }
});

/**
 * Callable function to cancel an order and restore stock exactly once
 */
export const cancelOrder = functions.https.onCall(async (data: { orderId: string }, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'লগইন করা আবশ্যক।');
  }

  if (!data.orderId) {
    throw new functions.https.HttpsError('invalid-argument', 'Order ID is required.');
  }

  const isAdmin = context.auth.token.admin === true;

  try {
    const result = await handleCancelOrder(data.orderId, context.auth.uid, isAdmin);
    return result;
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    throw new functions.https.HttpsError('failed-precondition', error.message || 'অর্ডার বাতিল করা সম্ভব হয়নি।');
  }
});

/**
 * Callable function to validate coupon server-side
 */
export const validateCoupon = functions.https.onCall(async (data: { code: string; subtotal: number }, context) => {
  try {
    const result = await handleValidateCoupon(data.code, data.subtotal);
    return result;
  } catch (error: any) {
    throw new functions.https.HttpsError('invalid-argument', error.message);
  }
});

/**
 * Callable function to publish seasonal theme (Admin Only)
 */
export const publishTheme = functions.https.onCall(async (data: { themeId: ThemeId }, context) => {
  if (!context.auth || context.auth.token.admin !== true) {
    // Check also if user exists in admins collection
    const adminDoc = await admin.firestore().collection('admins').doc(context.auth?.uid || 'none').get();
    if (!adminDoc.exists) {
      throw new functions.https.HttpsError('permission-denied', 'শুধুমাত্র অনুমোদিত অ্যাডমিন থিম পরিবর্তন করতে পারবেন।');
    }
  }

  try {
    const adminUid = context.auth?.uid || 'admin';
    const result = await handlePublishTheme(data.themeId, adminUid);
    return result;
  } catch (error: any) {
    throw new functions.https.HttpsError('invalid-argument', error.message);
  }
});

/**
 * Callable function to assign admin role (First admin or Super admin)
 */
export const setAdminRole = functions.https.onCall(async (data: { targetUid: string; isAdmin: boolean }, context) => {
  // Allow if requester is admin or if no admins exist yet (initial bootstrapping)
  const adminsSnap = await admin.firestore().collection('admins').limit(1).get();
  const isFirstAdminBootstrap = adminsSnap.empty;

  if (!isFirstAdminBootstrap) {
    if (!context.auth || context.auth.token.admin !== true) {
      throw new functions.https.HttpsError('permission-denied', 'Only an authorized administrator can assign roles.');
    }
  }

  try {
    const result = await handleSetAdminRole(data.targetUid, data.isAdmin);
    return result;
  } catch (error: any) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Callable function to set delivery person role (Admin Only)
 */
export const setDeliveryRole = functions.https.onCall(async (data: { targetUid: string; profileData: any }, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'লগইন করা আবশ্যক।');
  }

  // Check if admin
  const adminDoc = await admin.firestore().collection('admins').doc(context.auth.uid).get();
  if (!adminDoc.exists && context.auth.token.admin !== true) {
    throw new functions.https.HttpsError('permission-denied', 'শুধুমাত্র অ্যাডমিন ডেলিভারি কর্মী নিয়োগ দিতে পারবেন।');
  }

  try {
    return await handleSetDeliveryRole(data.targetUid, data.profileData);
  } catch (error: any) {
    throw new functions.https.HttpsError('invalid-argument', error.message);
  }
});

/**
 * Callable function to assign or reassign delivery person (Admin Only)
 */
export const assignDeliveryPerson = functions.https.onCall(async (data: AssignDeliveryRequest, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'লগইন করা আবশ্যক।');
  }

  const adminDoc = await admin.firestore().collection('admins').doc(context.auth.uid).get();
  if (!adminDoc.exists && context.auth.token.admin !== true) {
    throw new functions.https.HttpsError('permission-denied', 'অ্যাডমিন অনুমতি আবশ্যক।');
  }

  try {
    return await handleAssignDeliveryPerson(data, context.auth.uid);
  } catch (error: any) {
    throw new functions.https.HttpsError('failed-precondition', error.message);
  }
});

/**
 * Callable function to start delivery (Delivery Person Only)
 */
export const startDelivery = functions.https.onCall(async (data: { orderId: string }, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'লগইন করা আবশ্যক।');
  }

  try {
    return await handleStartDelivery(data.orderId, context.auth.uid);
  } catch (error: any) {
    throw new functions.https.HttpsError('failed-precondition', error.message);
  }
});

/**
 * Callable function to update live GPS coordinates (Delivery Person Only)
 */
export const updateDeliveryLocation = functions.https.onCall(async (data: UpdateLocationRequest, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'লগইন করা আবশ্যক।');
  }

  try {
    return await handleUpdateLocation(data, context.auth.uid);
  } catch (error: any) {
    throw new functions.https.HttpsError('invalid-argument', error.message);
  }
});

/**
 * Callable function to mark order as handed over to customer (Delivery Person Only)
 */
export const markHandedOver = functions.https.onCall(async (data: { orderId: string }, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'লগইন করা আবশ্যক।');
  }

  try {
    return await handleMarkHandedOver(data.orderId, context.auth.uid);
  } catch (error: any) {
    throw new functions.https.HttpsError('failed-precondition', error.message);
  }
});

/**
 * Callable function for customer to independently confirm receipt
 */
export const confirmCustomerReceipt = functions.https.onCall(async (data: ConfirmReceiptRequest, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'লগইন করা আবশ্যক।');
  }

  try {
    return await handleConfirmCustomerReceipt(data, context.auth.uid);
  } catch (error: any) {
    throw new functions.https.HttpsError('failed-precondition', error.message);
  }
});

/**
 * Callable function for customer to report delivery problem
 */
export const reportDeliveryIssue = functions.https.onCall(async (data: ReportIssueRequest, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'লগইন করা আবশ্যক।');
  }

  try {
    return await handleReportDeliveryIssue(data, context.auth.uid);
  } catch (error: any) {
    throw new functions.https.HttpsError('invalid-argument', error.message);
  }
});

/**
 * Callable function to record delivery person payment (Admin Only)
 */
export const recordDeliveryPayment = functions.https.onCall(async (data: RecordPaymentRequest, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'লগইন করা আবশ্যক।');
  }

  const adminDoc = await admin.firestore().collection('admins').doc(context.auth.uid).get();
  if (!adminDoc.exists && context.auth.token.admin !== true) {
    throw new functions.https.HttpsError('permission-denied', 'শুধুমাত্র অনুমোদিত অ্যাডমিন পেমেন্ট রেকর্ড করতে পারবেন।');
  }

  try {
    return await handleRecordDeliveryPayment(data, context.auth.uid);
  } catch (error: any) {
    throw new functions.https.HttpsError('failed-precondition', error.message);
  }
});

