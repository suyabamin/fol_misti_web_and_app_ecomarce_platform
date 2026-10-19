import * as admin from 'firebase-admin';
import { CreateOrderRequest, OrderItem, OrderStatus, PaymentStatus } from '../types';

export async function handleCreateOrder(
  data: CreateOrderRequest,
  userId: string,
  userEmail?: string
) {
  const db = admin.firestore();

  const { idempotencyKey, items, deliveryAddress, deliveryAreaId, couponCode } = data;

  if (!idempotencyKey || typeof idempotencyKey !== 'string') {
    throw new Error('Valid idempotencyKey is required.');
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Order must contain at least one item.');
  }

  if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.address) {
    throw new Error('Complete delivery address (Full name, Phone, Address) is required.');
  }

  // Idempotency check: look for order with same idempotencyKey
  const existingOrderQuery = await db.collection('orders')
    .where('idempotencyKey', '==', idempotencyKey)
    .limit(1)
    .get();

  if (!existingOrderQuery.empty) {
    const existing = existingOrderQuery.docs[0];
    return {
      orderId: existing.id,
      ...existing.data(),
      isExisting: true
    };
  }

  // Fetch delivery area
  let deliveryFee = 60; // default inside Dhaka
  if (deliveryAreaId) {
    const areaDoc = await db.collection('deliveryAreas').doc(deliveryAreaId).get();
    if (areaDoc.exists) {
      const areaData = areaDoc.data();
      if (areaData && typeof areaData.fee === 'number') {
        deliveryFee = Math.round(areaData.fee);
      }
    }
  }

  // Execute atomic transaction for inventory & order creation
  const result = await db.runTransaction(async (transaction) => {
    // 1. Fetch all products to verify prices and stock
    const productRefs = items.map(item => db.collection('products').doc(item.productId));
    const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));

    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (let i = 0; i < items.length; i++) {
      const itemReq = items[i];
      const pDoc = productDocs[i];

      if (!pDoc.exists) {
        throw new Error(`Product with ID ${itemReq.productId} was not found.`);
      }

      const pData = pDoc.data()!;
      if (!pData.isActive) {
        throw new Error(`Product "${pData.name}" is no longer active.`);
      }

      const requestedQty = Math.floor(Number(itemReq.quantity));
      if (requestedQty <= 0) {
        throw new Error(`Invalid quantity for product "${pData.name}".`);
      }

      const currentStock = Number(pData.stock ?? 0);
      if (currentStock < requestedQty) {
        throw new Error(`Insufficient stock for "${pData.name}". Available: ${currentStock}, Requested: ${requestedQty}`);
      }

      // Safe integer minor or standard BDT price representation
      const price = Math.round(Number(pData.discountPrice || pData.price));
      const lineTotal = price * requestedQty;
      subtotal += lineTotal;

      orderItems.push({
        productId: itemReq.productId,
        name: pData.name,
        nameBn: pData.nameBn || pData.name,
        price: price,
        unit: pData.unit || 'কেজি',
        quantity: requestedQty,
        imageUrl: pData.imageUrl || '',
        total: lineTotal
      });
    }

    // 2. Validate coupon if provided
    let discount = 0;
    let couponRef = null;
    if (couponCode && couponCode.trim()) {
      const cleanCode = couponCode.trim().toUpperCase();
      const couponQuery = await db.collection('coupons')
        .where('code', '==', cleanCode)
        .where('isActive', '==', true)
        .limit(1)
        .get();

      if (!couponQuery.empty) {
        const cDoc = couponQuery.docs[0];
        const cData = cDoc.data();
        const now = new Date();

        const validFrom = cData.validFrom ? new Date(cData.validFrom) : null;
        const validUntil = cData.validUntil ? new Date(cData.validUntil) : null;

        const isDateValid = (!validFrom || now >= validFrom) && (!validUntil || now <= validUntil);
        const meetsMinSpend = !cData.minOrderAmount || subtotal >= cData.minOrderAmount;
        const hasRemainingUses = !cData.usageLimit || (cData.usageCount || 0) < cData.usageLimit;

        if (isDateValid && meetsMinSpend && hasRemainingUses) {
          couponRef = cDoc.ref;
          if (cData.type === 'percentage') {
            discount = Math.round((subtotal * cData.value) / 100);
            if (cData.maxDiscount && discount > cData.maxDiscount) {
              discount = cData.maxDiscount;
            }
          } else {
            discount = Math.min(subtotal, Math.round(cData.value));
          }
        }
      }
    }

    const total = Math.max(0, subtotal - discount + deliveryFee);

    // 3. Decrement stock for all items
    for (let i = 0; i < items.length; i++) {
      const pDoc = productDocs[i];
      const pData = pDoc.data()!;
      const newStock = Number(pData.stock) - orderItems[i].quantity;
      transaction.update(pDoc.ref, {
        stock: newStock,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // 4. Increment coupon usage if used
    if (couponRef) {
      transaction.update(couponRef, {
        usageCount: admin.firestore.FieldValue.increment(1)
      });
    }

    // 5. Generate Order ID
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderDocRef = db.collection('orders').doc();
    const orderNumber = `FM-${new Date().getFullYear()}-${randomSuffix}`;

    const orderData = {
      orderNumber,
      idempotencyKey,
      userId,
      userEmail: userEmail || '',
      items: orderItems,
      subtotal,
      discount,
      deliveryFee,
      total,
      currency: 'BDT',
      paymentMethod: 'cod',
      paymentStatus: 'pending' as PaymentStatus,
      status: 'pending' as OrderStatus,
      deliveryAddress,
      deliveryAreaId: deliveryAreaId || 'dhaka-inside',
      appliedCoupon: couponCode || null,
      statusHistory: [
        {
          status: 'pending' as OrderStatus,
          timestamp: new Date().toISOString(),
          note: 'অর্ডার গৃহীত হয়েছে (Order Placed)'
        }
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    transaction.set(orderDocRef, orderData);

    return {
      orderId: orderDocRef.id,
      orderNumber,
      total,
      status: 'pending'
    };
  });

  return result;
}
