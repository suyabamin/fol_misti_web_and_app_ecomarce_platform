import { Category } from '../models';
import { INITIAL_CATEGORIES } from '../data/initialData';
import { db, isFirebaseConfigured } from '../services/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const STORAGE_KEY = 'folmishti_categories';

function getLocalCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CATEGORIES;
  }
}

function saveLocalCategories(cats: Category[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
  } catch (e) {
    console.error(e);
  }
}

export const categoryRepository = {
  async getAll(): Promise<Category[]> {
    if (isFirebaseConfigured) {
      try {
        const snap = await getDocs(collection(db, 'categories'));
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
        }
      } catch (err) {
        console.warn('Firestore category fetch error', err);
      }
    }
    return getLocalCategories();
  },

  async save(category: Category): Promise<Category> {
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'categories', category.id), category, { merge: true });
      } catch (err) {
        console.warn(err);
      }
    }
    const list = getLocalCategories();
    const idx = list.findIndex(c => c.id === category.id);
    if (idx >= 0) {
      list[idx] = category;
    } else {
      list.push(category);
    }
    saveLocalCategories(list);
    return category;
  },

  async delete(id: string): Promise<void> {
    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'categories', id));
      } catch (err) {
        console.warn(err);
      }
    }
    const list = getLocalCategories().filter(c => c.id !== id);
    saveLocalCategories(list);
  }
};
