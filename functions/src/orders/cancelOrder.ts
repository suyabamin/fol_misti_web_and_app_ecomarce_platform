import * as admin from 'firebase-admin';
import { OrderItem } from '../types';

export async function handleCancelOrder(orderId: string, userId: string, isAdmin: boolean) {
  const db = admin.firestore();
  const orderRef = db.collection('orders').doc(orderId);

  return db.runTransaction(async (transaction) => {
    const orderDoc = await transaction.get(orderRef);
    if (!orderDoc.exists) {
      throw new Error('Order not found.');
    }

    const orderData = orderDoc.data()!;

    // Security check: only order owner or admin can cancel
    if (!isAdmin && orderData.userId !== userId) {
      throw new Error('Unauthorized to cancel this order.');
    }

    // Cancellation eligibility check
    if (orderData.status !== 'pending' && orderData.status !== 'processing') {
      throw new Error(`Order cannot be cancelled in "${orderData.status}" status.`);
    }

    // Check if stock has already been restored to prevent double-restoration
    if (orderData.stockRestored === true) {
      throw new Error('Stock for this order has already been restored.');
    }

    // Restore stock for all order items
    const items: OrderItem[] = orderData.items || [];
    for (const item of items) {
      const pRef = db.collection('products').doc(item.productId);
      const pDoc = await transaction.get(pRef);
      if (pDoc.exists) {
        const currentStock = Number(pDoc.data()?.stock || 0);
        transaction.update(pRef, {
          stock: currentStock + item.quantity,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    // Update order status to cancelled
    const history = orderData.statusHistory || [];
    history.push({
      status: 'cancelled',
      timestamp: new Date().toISOString(),
      note: isAdmin ? 'অর্ডারটি অ্যাডমিন কর্তৃক বাতিল করা হয়েছে।' : 'অর্ডারটি গ্রাহক কর্তৃক বাতিল করা হয়েছে।'
    });

    transaction.update(orderRef, {
      status: 'cancelled',
      stockRestored: true,
      statusHistory: history,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      orderId,
      status: 'cancelled'
    };
  });
}
