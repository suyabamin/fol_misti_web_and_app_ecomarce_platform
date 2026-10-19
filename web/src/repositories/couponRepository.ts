import { Coupon } from '../models';
import { INITIAL_COUPONS } from '../data/initialData';
import { db, isFirebaseConfigured } from '../services/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const STORAGE_KEY = 'folmishti_coupons';

function getLocalCoupons(): Coupon[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COUPONS));
      return INITIAL_COUPONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_COUPONS;
  }
}

function saveLocalCoupons(coupons: Coupon[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
  } catch (e) {
    console.error(e);
  }
}

export const couponRepository = {
  async getAll(): Promise<Coupon[]> {
    if (isFirebaseConfigured) {
      try {
        const snap = await getDocs(collection(db, 'coupons'));
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as Coupon));
        }
      } catch (err) {
        console.warn(err);
      }
    }
    return getLocalCoupons();
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ isValid: boolean; discount: number; message: string; coupon?: Coupon }> {
    const cleanCode = code.trim().toUpperCase();
    const coupons = await this.getAll();
    const coupon = coupons.find(c => c.code.toUpperCase() === cleanCode && c.isActive);

    if (!coupon) {
      return { isValid: false, discount: 0, message: 'কুপন কোডটি সঠিক নয় বা মেয়াদ শেষ হয়ে গেছে।' };
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return { isValid: false, discount: 0, message: `এই কুপনের জন্য সর্বনিম্ন ৳${coupon.minOrderAmount} টাকার অর্ডার প্রয়োজন।` };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { isValid: false, discount: 0, message: 'এই কুপনের সর্বোচ্চ ব্যবহারের সীমা শেষ হয়ে গেছে।' };
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.round((subtotal * coupon.value) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(subtotal, Math.round(coupon.value));
    }

    return {
      isValid: true,
      discount,
      message: `কুপন সফলভাবে প্রয়োগ করা হয়েছে! ৳${discount} ছাড়।`,
      coupon
    };
  },

  async save(coupon: Coupon): Promise<Coupon> {
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'coupons', coupon.id), coupon, { merge: true });
      } catch (err) {
        console.warn(err);
      }
    }
    const list = getLocalCoupons();
    const idx = list.findIndex(c => c.id === coupon.id);
    if (idx >= 0) {
      list[idx] = coupon;
    } else {
      list.push(coupon);
    }
    saveLocalCoupons(list);
    return coupon;
  },

  async delete(id: string): Promise<void> {
    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'coupons', id));
      } catch (err) {
        console.warn(err);
      }
    }
    const list = getLocalCoupons().filter(c => c.id !== id);
    saveLocalCoupons(list);
  }
};
