import { Product } from '../models';
import { INITIAL_PRODUCTS } from '../data/initialData';
import { db, isFirebaseConfigured } from '../services/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

const STORAGE_KEY = 'folmishti_products';

function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

function saveLocalProducts(products: Product[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export const productRepository = {
  async getAll(): Promise<Product[]> {
    if (isFirebaseConfigured) {
      try {
        const snap = await getDocs(collection(db, 'products'));
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
        }
      } catch (err) {
        console.warn('Firestore read failed or offline, falling back to local dataset', err);
      }
    }
    return getLocalProducts();
  },

  async getById(id: string): Promise<Product | null> {
    const products = await this.getAll();
    return products.find(p => p.id === id) || null;
  },

  async getByCategory(category: string): Promise<Product[]> {
    const products = await this.getAll();
    if (category === 'all') return products;
    return products.filter(p => p.category === category || p.slug === category);
  },

  async getFeatured(): Promise<Product[]> {
    const products = await this.getAll();
    return products.filter(p => p.isFeatured && p.isActive);
  },

  async getSeasonal(seasonType?: string): Promise<Product[]> {
    const products = await this.getAll();
    return products.filter(p => p.isSeasonal && p.isActive && (!seasonType || p.seasonType === seasonType));
  },

  async save(product: Product): Promise<Product> {
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'products', product.id), product, { merge: true });
      } catch (err) {
        console.warn('Firestore write failed, falling back to local', err);
      }
    }
    const list = getLocalProducts();
    const idx = list.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      list[idx] = product;
    } else {
      list.unshift(product);
    }
    saveLocalProducts(list);
    return product;
  },

  async updateStock(productId: string, newStock: number): Promise<void> {
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'products', productId), { stock: newStock });
      } catch (err) {
        console.warn('Firestore stock update failed', err);
      }
    }
    const list = getLocalProducts();
    const idx = list.findIndex(p => p.id === productId);
    if (idx >= 0) {
      list[idx].stock = newStock;
      saveLocalProducts(list);
    }
  },

  async delete(productId: string): Promise<void> {
    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'products', productId));
      } catch (err) {
        console.warn('Firestore delete failed', err);
      }
    }
    const list = getLocalProducts().filter(p => p.id !== productId);
    saveLocalProducts(list);
  }
};
