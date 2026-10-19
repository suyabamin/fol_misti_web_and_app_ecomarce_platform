import { Review } from '../models';
import { db, isFirebaseConfigured } from '../services/firebase';
import { collection, getDocs, doc, setDoc, query, where, orderBy, deleteDoc, updateDoc } from 'firebase/firestore';

const STORAGE_KEY = 'folmishti_reviews';

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-mango-1',
    productName: 'রাজশাহীর সেরা হিমসাগর আম',
    userId: 'user-1',
    userName: 'Tanvir Ahmed',
    rating: 5,
    comment: 'অসাধারণ মিষ্টি আম! একদম কাঁচা থেকে ঘরে দুই দিনে পেকেছে, কোনো কেমিক্যাল নেই। রাজশাহীর আসল স্বাদ!',
    status: 'approved',
    createdAt: '2026-05-15T10:30:00Z'
  },
  {
    id: 'rev-2',
    productId: 'prod-sweet-1',
    productName: 'ঐতিহ্যবাহী নরম স্পঞ্জ রসগোল্লা',
    userId: 'user-2',
    userName: 'Nusrat Jahan',
    rating: 5,
    comment: 'এত নরম স্পঞ্জ রসগোল্লা ঢাকায় আগে কখনো খাইনি। রস অতিরিক্ত মিষ্টি না, একদম পারফেক্ট ব্যালেন্স।',
    status: 'approved',
    createdAt: '2026-06-02T14:20:00Z'
  },
  {
    id: 'rev-3',
    productId: 'prod-sweet-3',
    productName: 'বগুড়ার স্পেশাল ঐতিহ্যবাহী মিষ্টি দই',
    userId: 'user-3',
    userName: 'Mahmudul Hasan',
    rating: 5,
    comment: 'বগুড়ার আসল স্বাদের লালচে দই। প্যাকেজিং খুব সুন্দর ও সুরক্ষিত ছিল। ধন্যবাদ ফল মিষ্টি টিম!',
    status: 'approved',
    createdAt: '2026-06-10T18:45:00Z'
  }
];

function getLocalReviews(): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_REVIEWS;
  }
}

function saveLocalReviews(reviews: Review[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.error(e);
  }
}

export const reviewRepository = {
  async getAll(): Promise<Review[]> {
    if (isFirebaseConfigured) {
      try {
        const snap = await getDocs(collection(db, 'reviews'));
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
        }
      } catch (err) {
        console.warn(err);
      }
    }
    return getLocalReviews();
  },

  async getByProduct(productId: string): Promise<Review[]> {
    const all = await this.getAll();
    return all.filter(r => r.productId === productId && r.status === 'approved');
  },

  async submitReview(review: Omit<Review, 'id' | 'createdAt' | 'status'>): Promise<Review> {
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      status: 'approved', // Auto-approved for verified purchase demo, moderatable in admin
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'reviews', newRev.id), newRev);
      } catch (err) {
        console.warn(err);
      }
    }

    const list = getLocalReviews();
    list.unshift(newRev);
    saveLocalReviews(list);
    return newRev;
  },

  async updateStatus(reviewId: string, status: 'approved' | 'rejected' | 'pending'): Promise<void> {
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'reviews', reviewId), { status });
      } catch (err) {
        console.warn(err);
      }
    }
    const list = getLocalReviews();
    const r = list.find(item => item.id === reviewId);
    if (r) {
      r.status = status;
      saveLocalReviews(list);
    }
  },

  async delete(reviewId: string): Promise<void> {
    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'reviews', reviewId));
      } catch (err) {
        console.warn(err);
      }
    }
    const list = getLocalReviews().filter(r => r.id !== reviewId);
    saveLocalReviews(list);
  }
};
