import * as admin from 'firebase-admin';

export async function handleValidateCoupon(code: string, subtotal: number) {
  if (!code || !code.trim()) {
    throw new Error('Coupon code is required.');
  }

  const cleanCode = code.trim().toUpperCase();
  const db = admin.firestore();

  const query = await db.collection('coupons')
    .where('code', '==', cleanCode)
    .where('isActive', '==', true)
    .limit(1)
    .get();

  if (query.empty) {
    throw new Error('কুপন কোডটি সঠিক নয় বা মেয়াদ শেষ হয়ে গেছে।');
  }

  const cDoc = query.docs[0];
  const cData = cDoc.data();
  const now = new Date();

  if (cData.validFrom && now < new Date(cData.validFrom)) {
    throw new Error('এই কুপনটি এখনো সক্রিয় হয়নি।');
  }

  if (cData.validUntil && now > new Date(cData.validUntil)) {
    throw new Error('এই কুপনটির মেয়াদ শেষ হয়ে গেছে।');
  }

  if (cData.usageLimit && (cData.usageCount || 0) >= cData.usageLimit) {
    throw new Error('এই কুপনটির সর্বোচ্চ ব্যবহারের সীমা শেষ হয়ে গেছে।');
  }

  if (cData.minOrderAmount && subtotal < cData.minOrderAmount) {
    throw new Error(`এই কুপন ব্যবহারের জন্য সর্বনিম্ন ৳${cData.minOrderAmount} টাকার অর্ডার প্রয়োজন।`);
  }

  let discount = 0;
  if (cData.type === 'percentage') {
    discount = Math.round((subtotal * cData.value) / 100);
    if (cData.maxDiscount && discount > cData.maxDiscount) {
      discount = cData.maxDiscount;
    }
  } else {
    discount = Math.min(subtotal, Math.round(cData.value));
  }

  return {
    isValid: true,
    code: cleanCode,
    discount,
    discountType: cData.type,
    discountValue: cData.value
  };
}
